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
  subscription: Stripe.Subscription,
  customerId: string,
  profileId: string
) {
  const supabase = createServiceRoleClient();
  const subAny = subscription as any;

  const planName = await resolvePlanName(subscription);
  const billingInterval = resolveBillingInterval(subscription);

  // Use subscription's created date as start date
  const startDate = new Date(subscription.created * 1000);
  const currentPeriodStartIso = startDate.toISOString();

  // Calculate end date based on billing interval
  const endDate = new Date(startDate);
  if (billingInterval === "annual") {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    endDate.setMonth(endDate.getMonth() + 1);
  }
  const currentPeriodEndIso = endDate.toISOString();

  console.log(`[Subscription Sync] Custom Dates - Interval: ${billingInterval}, Start: ${currentPeriodStartIso}, End: ${currentPeriodEndIso}`);

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

  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
  if (!checkoutSession || checkoutSession.payment_status !== "paid") {
    return { error: "Payment not completed." };
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
    return { error: "Subscription data missing." };
  }

  const sub = await stripe.subscriptions.retrieve(subId);

  await upsertSubscriptionFromStripe(sub, customerId, session.user.id);

  return { ok: true };
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
