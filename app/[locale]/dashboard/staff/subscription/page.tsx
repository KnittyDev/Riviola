import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SubscriptionClient } from "./SubscriptionClient";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function StaffSubscriptionPage() {
  const tPricing = await getTranslations("Pricing");
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (!profile || (profile.role !== "staff" && profile.role !== "admin")) {
    redirect("/dashboard");
  }

  /**
   * Stripe Price IDs – replace with your real IDs from Stripe Dashboard → Products.
   */
  const pricingTiers = [
    {
      name: tPricing("tiers.essence.name"),
      description: tPricing("tiers.essence.description"),
      monthlyPriceId: process.env.STRIPE_ESSENCE_MONTHLY_PRICE_ID ?? "",
      annualPriceId: process.env.STRIPE_ESSENCE_ANNUAL_PRICE_ID ?? "",
      monthlyPrice: 99,
      annualPrice: 719,
      features: (tPricing.raw("tiers.essence.features") as string[]).filter(f => !f.toLowerCase().includes("commission")),
      recommended: false,
    },
    {
      name: tPricing("tiers.signature.name"),
      description: tPricing("tiers.signature.description"),
      monthlyPriceId: process.env.STRIPE_SIGNATURE_MONTHLY_PRICE_ID ?? "",
      annualPriceId: process.env.STRIPE_SIGNATURE_ANNUAL_PRICE_ID ?? "",
      monthlyPrice: 149,
      annualPrice: 999,
      features: (tPricing.raw("tiers.signature.features") as string[]).filter(f => !f.toLowerCase().includes("commission")),
      recommended: true,
    },
    {
      name: tPricing("tiers.ultraDeluxe.name"),
      description: tPricing("tiers.ultraDeluxe.description"),
      monthlyPriceId: process.env.STRIPE_ULTRA_DELUXE_MONTHLY_PRICE_ID ?? "",
      annualPriceId: process.env.STRIPE_ULTRA_DELUXE_ANNUAL_PRICE_ID ?? "",
      monthlyPrice: 199,
      annualPrice: 1299,
      features: (tPricing.raw("tiers.ultraDeluxe.features") as string[]).filter(f => !f.toLowerCase().includes("commission")),
      recommended: false,
    },
  ];

  // Fetch active subscription
  const { data: subRows } = await supabase
    .from("subscriptions")
    .select(
      "plan_name, billing_interval, status, current_period_start, current_period_end, cancel_at_period_end, stripe_price_id"
    )
    .eq("profile_id", session.user.id)
    .in("status", ["active", "trialing", "past_due"])
    .order("created_at", { ascending: false })
    .limit(1);

  const subscription = subRows?.[0] ?? null;

  return (
    <SubscriptionClient subscription={subscription} tiers={pricingTiers} />
  );
}
