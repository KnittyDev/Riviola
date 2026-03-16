import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SubscriptionClient } from "./SubscriptionClient";

export const dynamic = "force-dynamic";

/**
 * Stripe Price IDs – replace with your real IDs from Stripe Dashboard → Products.
 * Each product should have a monthly and yearly price.
 */
const PRICING_TIERS = [
  {
    name: "Essence",
    description: "Perfect for single buildings or small portfolios.",
    monthlyPriceId: process.env.STRIPE_ESSENCE_MONTHLY_PRICE_ID ?? "",
    annualPriceId: process.env.STRIPE_ESSENCE_ANNUAL_PRICE_ID ?? "",
    monthlyPrice: 99,
    annualPrice: 719,
    features: [
      "Up to 2 Buildings / Projects",
      "Basic Investor Tracking",
      "Document Management",
      "Standard Financial Reporting",
      "Investor Portal Access",
    ],
    recommended: false,
  },
  {
    name: "Signature",
    description: "Optimized for professional property management firms.",
    monthlyPriceId: process.env.STRIPE_SIGNATURE_MONTHLY_PRICE_ID ?? "",
    annualPriceId: process.env.STRIPE_SIGNATURE_ANNUAL_PRICE_ID ?? "",
    monthlyPrice: 149,
    annualPrice: 999,
    features: [
      "All Essence features",
      "Up to 10 Buildings / Projects",
      "Automated Dues Collection",
      "Advanced Financial Analytics",
      "Auto Invoice Generation",
      "Request & Maintenance Tracking",
    ],
    recommended: true,
  },
  {
    name: "Ultra Deluxe",
    description: "Enterprise-grade features for large-scale operations.",
    monthlyPriceId: process.env.STRIPE_ULTRA_DELUXE_MONTHLY_PRICE_ID ?? "",
    annualPriceId: process.env.STRIPE_ULTRA_DELUXE_ANNUAL_PRICE_ID ?? "",
    monthlyPrice: 199,
    annualPrice: 1299,
    features: [
      "All Signature features",
      "Unlimited Buildings & Projects",
      "Full Customization",
      "Priority Support & Dedicated Manager",
      "White-label Investor Reports",
      "Bulk Payment Processing",
    ],
    recommended: false,
  },
];

export default async function StaffSubscriptionPage() {
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
    <SubscriptionClient subscription={subscription} tiers={PRICING_TIERS} />
  );
}
