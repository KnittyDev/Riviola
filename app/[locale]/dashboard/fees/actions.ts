"use server";

import { headers } from "next/headers";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getStripe } from "@/lib/stripe";
import { getBuildingDuesSettings } from "@/lib/duesPayments";

export type CreateCheckoutResult = { ok: boolean; url?: string; error?: string };

/**
 * Creates a Stripe Checkout Session for paying a single dues fee. Returns the session URL to redirect the user.
 * Requires the fee to have an amount set by staff (building_dues_settings.amount_cents).
 */
export async function createDuesCheckoutSessionAction(
  investorPropertyId: string,
  periodKey: string
): Promise<CreateCheckoutResult> {
  const supabase = await createClient();
  const {
    data: { session: authSession },
  } = await supabase.auth.getSession();
  if (!authSession?.user) return { ok: false, error: "Not authenticated" };

  const { data: prop } = await supabase
    .from("investor_properties")
    .select("id, profile_id, building_id")
    .eq("id", investorPropertyId)
    .single();

  if (!prop || prop.profile_id !== authSession.user.id)
    return { ok: false, error: "Not your property" };

  const settings = await getBuildingDuesSettings(supabase, prop.building_id);
  const amountCents = settings?.amount_cents ?? 0;
  const currency = (settings?.currency ?? "EUR").toLowerCase();

  if (!amountCents || amountCents < 1)
    return { ok: false, error: "Dues amount is not set for this building. Please contact your building manager." };

  let stripe;
  try {
    stripe = getStripe();
  } catch {
    return { ok: false, error: "Payment is not configured." };
  }

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const base = `${proto}://${host}`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: amountCents,
          product_data: {
            name: "Dues payment",
            description: `Common charges (Aidat) – ${periodKey}`,
          },
        },
      },
    ],
    metadata: {
      investor_property_id: investorPropertyId,
      period: periodKey,
      profile_id: authSession.user.id,
    },
    success_url: `${base}/dashboard/fees?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/dashboard/fees`,
  });

  const url = session.url ?? undefined;
  if (!url) return { ok: false, error: "Could not create checkout session." };
  return { ok: true, url };
}

export type ConfirmDuesPaymentResult = { ok: boolean; error?: string };

/**
 * After Stripe Checkout redirect: verify the session with Stripe and record the dues payment.
 * No webhook – we confirm directly via Stripe API.
 */
export async function confirmDuesPaymentFromSessionAction(
  checkoutSessionId: string
): Promise<ConfirmDuesPaymentResult> {
  const supabase = await createClient();
  const {
    data: { session: authSession },
  } = await supabase.auth.getSession();
  if (!authSession?.user) return { ok: false, error: "Not authenticated" };

  let stripe;
  try {
    stripe = getStripe();
  } catch (e) {
    return { ok: false, error: "Payment is not configured." };
  }

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(checkoutSessionId, {
      expand: [],
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Stripe session could not be loaded.";
    return { ok: false, error: msg };
  }

  if (session.payment_status !== "paid")
    return { ok: false, error: `Payment not completed (status: ${session.payment_status}).` };

  const metadata = session.metadata ?? {};
  const investorPropertyId =
    typeof metadata.investor_property_id === "string" ? metadata.investor_property_id : null;
  const period = typeof metadata.period === "string" ? metadata.period : null;
  const profileId = typeof metadata.profile_id === "string" ? metadata.profile_id : null;

  if (!investorPropertyId || !period)
    return { ok: false, error: "Invalid session (missing metadata)." };

  if (profileId !== authSession.user.id)
    return { ok: false, error: "Session does not belong to you." };

  const serviceSupabase = createServiceRoleClient();
  const now = new Date().toISOString();

  const { error } = await serviceSupabase
    .from("dues_payments")
    .upsert(
      {
        investor_property_id: investorPropertyId,
        period,
        paid_at: now,
        marked_by: null,
      },
      { onConflict: "investor_property_id,period" }
    );

  if (error) {
    console.error("[confirmDuesPayment] upsert error:", error.message, error.code, error.details);
    return { ok: false, error: error.message || "Failed to record payment." };
  }
  revalidatePath("/dashboard/fees");
  return { ok: true };
}
