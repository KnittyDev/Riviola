"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";

type ActionResult = { ok?: boolean; url?: string; error?: string };

/* ─── helpers ───────────────────────────────────────────────── */

async function resolvePlanName(sub: Stripe.Subscription): Promise<string> {
  const item = sub.items?.data?.[0];
  const price = item?.price;
  if (!price) return "Essence";

  let product = price.product;
  
  // If product is only an ID, we need to fetch it to get the name
  if (typeof product === "string") {
    const stripe = getStripe();
    product = await stripe.products.retrieve(product);
  }

  const productName = (product as Stripe.Product)?.name;
  if (productName) {
    const lower = productName.toLowerCase();
    if (lower.includes("ultra") || lower.includes("deluxe")) return "Ultra Deluxe";
    if (lower.includes("signature")) return "Signature";
    if (lower.includes("essence")) return "Essence";
    return productName;
  }
  return "Essence";
}

function resolveBillingInterval(sub: Stripe.Subscription): string {
  const interval = sub.items?.data?.[0]?.price?.recurring?.interval;
  return interval === "year" ? "annual" : "monthly";
}

async function upsertSubscriptionFromStripe(
  subscription: any,
  customerId: string,
  profileId: string
) {
  const supabase = createServiceRoleClient();
  const subAny = subscription as any;

  const planName = await resolvePlanName(subscription);
  const billingInterval = resolveBillingInterval(subscription);

  // 1. Determine Start Date (Priority: Stripe > Now)
  let startDate = new Date();
  if (subscription.current_period_start) {
    startDate = new Date(subscription.current_period_start * 1000);
  }
  const currentPeriodStartIso = startDate.toISOString();

  // 2. Derive End Date (Always exactly 1 month or 1 year from start)
  // This ensures if it's May 29th, the end is June 29th.
  const endDate = new Date(startDate);
  if (billingInterval === "annual") {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    endDate.setMonth(endDate.getMonth() + 1);
  }
  
  // 3. Optional: Use Stripe's end date ONLY if it exists and is > start+1day
  // to account for potentially irregular first billing cycles, 
  // but prioritize user's request for exact month matching.
  let currentPeriodEndIso = endDate.toISOString();
  
  // Log the logic being applied
  console.log(`[Subscription Sync] Logic Applied - Start: ${currentPeriodStartIso}, Interval: ${billingInterval}, End: ${currentPeriodEndIso}`);

  const { error: upsertError } = await supabase.from("subscriptions").upsert(
    {
      profile_id: profileId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: subscription.items?.data?.[0]?.price?.id ?? null,
      plan_name: planName,
      billing_interval: billingInterval,
      status: subscription.status,
      current_period_start: currentPeriodStartIso,
      current_period_end: currentPeriodEndIso,
      cancel_at_period_end: subscription.cancel_at_period_end ?? false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" }
  );

  if (upsertError) {
    console.error("[Subscription Sync] Upsert Error:", upsertError.message);
  }

}

/* ─── Create Checkout ───────────────────────────────────────── */

export async function createSubscriptionCheckoutAction(
  priceId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, stripe_customer_id")
    .eq("id", session.user.id)
    .single();

  if (!profile) return { error: "Profile not found" };

  const stripe = getStripe();

  let customerId = profile.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile.email ?? session.user.email,
      metadata: { profile_id: profile.id },
    });
    customerId = customer.id;

    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", profile.id);
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/dashboard/staff/subscription?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/dashboard/staff/subscription?canceled=1`,
    subscription_data: {
      metadata: { profile_id: profile.id },
    },
  });

  return { ok: true, url: checkoutSession.url ?? undefined };
}

/* ─── Confirm after checkout (no webhook needed) ────────────── */

export async function confirmCheckoutSessionAction(
  sessionId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return { error: "Not authenticated" };

  const stripe = getStripe();

  try {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!checkoutSession) {
      return { error: "Checkout session not found." };
    }

    if (checkoutSession.payment_status !== "paid") {
      return { error: "Payment not completed or still processing." };
    }

    const customerId =
      typeof checkoutSession.customer === "string"
        ? checkoutSession.customer
        : checkoutSession.customer?.id;
    const subId =
      typeof checkoutSession.subscription === "string"
        ? checkoutSession.subscription
        : (checkoutSession.subscription as any)?.id;

    if (!customerId || !subId) {
      console.error("[Confirm Checkout] Missing data:", { customerId, subId });
      return { error: "Subscription data missing in session." };
    }

    const sub = await stripe.subscriptions.retrieve(subId);

    // Use service role for internal sync to avoid RLS issues
    await upsertSubscriptionFromStripe(sub, customerId, session.user.id);

    return { ok: true };
  } catch (err: any) {
    console.error("[Confirm Checkout Error]", err);
    return { error: err.message || "An unexpected error occurred during confirmation." };
  }
}

/* ─── Sync subscription on page load (no webhook needed) ────── */

export async function syncSubscriptionAction(): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", session.user.id)
    .single();

  if (!profile?.stripe_customer_id) return { ok: true }; // no customer yet

  const stripe = getStripe();

  const subscriptions = await stripe.subscriptions.list({
    customer: profile.stripe_customer_id,
    status: "all",
    limit: 1,
  });

  if (!subscriptions.data.length) {
    // Mark all local subs as canceled
    const serviceClient = createServiceRoleClient();
    await serviceClient
      .from("subscriptions")
      .update({ status: "canceled", updated_at: new Date().toISOString() })
      .eq("profile_id", session.user.id);
    return { ok: true };
  }

  // Retrieve the specific subscription
  const latestSub = await stripe.subscriptions.retrieve(subscriptions.data[0].id);

  await upsertSubscriptionFromStripe(
    latestSub,
    profile.stripe_customer_id,
    session.user.id
  );

  return { ok: true };
}

/* ─── Billing Portal ────────────────────────────────────────── */

export async function createBillingPortalAction(): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", session.user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return { error: "No active subscription found." };
  }

  const stripe = getStripe();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${origin}/dashboard/staff/subscription`,
  });

  return { ok: true, url: portalSession.url };
}

/* ─── Upgrade Subscription ───────────────────────────────────── */

export async function upgradeSubscriptionAction(
  priceId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", session.user.id)
    .single();

  if (!profile?.stripe_customer_id) return { error: "No active customer found." };

  const stripe = getStripe();

  // Find active subscription
  const subscriptions = await stripe.subscriptions.list({
    customer: profile.stripe_customer_id,
    status: "active",
    limit: 1,
  });

  if (!subscriptions.data.length) return { error: "No active subscription found to upgrade." };

  const currentSub = subscriptions.data[0] as any;
  const currentPriceId = currentSub.items.data[0]?.price.id;

  if (currentPriceId === priceId) return { error: "Already on this plan." };

  try {
    const updatedSub = await stripe.subscriptions.update(currentSub.id, {
      items: [
        {
          id: currentSub.items.data[0].id,
          price: priceId,
        },
      ],
      // Standard way to upgrade/change plan without immediate charge:
      // This will keep the current billing cycle date.
      // The new price will be charged at the NEXT billing date.
      proration_behavior: "none", 
    });

    await upsertSubscriptionFromStripe(
      updatedSub,
      profile.stripe_customer_id,
      session.user.id
    );

    return { ok: true };
  } catch (err: any) {
    console.error("[Upgrade Action Error]", err);
    return { error: err.message || "Could not upgrade." };
  }
}
