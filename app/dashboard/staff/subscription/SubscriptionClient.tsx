"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/lib/toast";
import {
  createSubscriptionCheckoutAction,
  createBillingPortalAction,
  confirmCheckoutSessionAction,
  syncSubscriptionAction,
} from "./actions";

type SubscriptionData = {
  plan_name: string;
  billing_interval: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_price_id: string | null;
};

type PricingTier = {
  name: string;
  description: string;
  monthlyPriceId: string;
  annualPriceId: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  recommended: boolean;
};

type Props = {
  subscription: SubscriptionData | null;
  tiers: PricingTier[];
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysRemaining(endDate: string | null): number {
  if (!endDate) return 0;
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: "bg-emerald-50", text: "text-emerald-600" },
  trialing: { bg: "bg-blue-50", text: "text-blue-600" },
  past_due: { bg: "bg-amber-50", text: "text-amber-600" },
  canceled: { bg: "bg-red-50", text: "text-red-600" },
  incomplete: { bg: "bg-gray-100", text: "text-gray-500" },
};

export function SubscriptionClient({ subscription, tiers }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [billingToggle, setBillingToggle] = useState<"monthly" | "annual">(
    subscription?.billing_interval === "annual" ? "annual" : "monthly"
  );
  const synced = useRef(false);

  useEffect(() => {
    const sessionId = searchParams?.get("session_id");
    if (sessionId) {
      setLoading("confirming");
      confirmCheckoutSessionAction(sessionId)
        .then((result) => {
          if (result.ok) {
            toast.success("Subscription activated! Welcome aboard.");
            // Hard redirect to clear search params and force server refetch
            window.location.href = "/dashboard/staff/subscription";
          } else {
            toast.error(result.error ?? "Could not confirm payment.");
            setLoading(null);
            router.replace("/dashboard/staff/subscription", { scroll: false });
          }
        })
        .catch(() => {
          setLoading(null);
          toast.error("An error occurred during confirmation.");
        });
      return;
    }

    if (searchParams?.get("canceled") === "1") {
      toast.error("Checkout was canceled.");
      router.replace("/dashboard/staff/subscription", { scroll: false });
      return;
    }

    // Sync subscription status from Stripe on page load if not confirmed yet
    if (subscription === null && !synced.current) {
      synced.current = true;
      syncSubscriptionAction().then(() => {
        router.refresh();
      });
    }
  }, [searchParams, router, subscription]);

  async function handleSubscribe(priceId: string) {
    setLoading(priceId);
    const result = await createSubscriptionCheckoutAction(priceId);
    setLoading(null);
    if (result.url) {
      window.location.href = result.url;
    } else {
      toast.error(result.error ?? "Could not start checkout.");
    }
  }

  async function handleManage() {
    setLoading("manage");
    const result = await createBillingPortalAction();
    setLoading(null);
    if (result.url) {
      window.location.href = result.url;
    } else {
      toast.error(result.error ?? "Could not open billing portal.");
    }
  }

  const isActive =
    subscription?.status === "active" || subscription?.status === "trialing";

  // ─── Global loading state for confirmation ────────────────────────
  if (loading === "confirming") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-12 h-12 border-4 border-[#134e4a] border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Confirming your subscription...</h2>
        <p className="text-gray-500 mt-2 text-sm">Please wait while we set things up for you.</p>
      </div>
    );
  }

  // ─── Active subscription view ──────────────────────────────────────
  if (subscription && isActive) {
    const hasPeriodEnd = !!subscription.current_period_end;
    const days = hasPeriodEnd ? daysRemaining(subscription.current_period_end) : null;
    const statusColor = statusColors[subscription.status] ?? statusColors.active;

    // Find current tier features
    const currentTier = tiers.find(t => t.name.toLowerCase() === subscription.plan_name.toLowerCase());

    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Subscription
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Plan and billing
        </p>

        <div className="mt-8 space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Current Plan
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xl font-bold text-gray-900">
                    {subscription.plan_name}
                  </p>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${statusColor.bg} ${statusColor.text}`}
                  >
                    {subscription.status}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-1">
                  Billed{" "}
                  {subscription.billing_interval === "annual"
                    ? "annually"
                    : "monthly"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Days left</p>
                <p className="text-2xl font-black text-[#134e4a] mt-0.5">
                  {hasPeriodEnd && days != null ? days : "—"}
                </p>
              </div>
            </div>

            {subscription.cancel_at_period_end && (
              <div className="mt-4 p-3 bg-amber-50 rounded-lg text-sm text-amber-700 flex items-center gap-2 border border-amber-100">
                <i className="las la-exclamation-triangle text-lg" />
                <p>Cancels on <b>{formatDate(subscription.current_period_end)}</b></p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4">Included Features</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                {currentTier?.features.map((f, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <div className="size-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <i className="las la-check text-xs font-bold" />
                    </div>
                    <span>{f}</span>
                  </li>
                ))}
                {!currentTier && (
                  <p className="text-sm text-gray-400 italic">Plan details loading...</p>
                )}
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="text-xs text-gray-400">Next billing date</p>
              <p className="text-sm font-bold text-gray-900">
                {hasPeriodEnd ? formatDate(subscription.current_period_end) : "—"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleManage}
              disabled={loading === "manage"}
              className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-xs font-extrabold hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm uppercase tracking-wider"
            >
              {loading === "manage" ? "Opening…" : "Billing Portal"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── No subscription → show pricing tiers ────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Choose your plan
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Select a subscription to unlock all features.
        </p>

        <div className="inline-flex p-1 bg-gray-100 rounded-2xl mt-6">
          <button
            type="button"
            onClick={() => setBillingToggle("monthly")}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-colors ${
              billingToggle === "monthly"
                ? "bg-white shadow-sm text-[#134e4a]"
                : "text-gray-500 hover:text-[#134e4a]"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingToggle("annual")}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-colors ${
              billingToggle === "annual"
                ? "bg-white shadow-sm text-[#134e4a]"
                : "text-gray-500 hover:text-[#134e4a]"
            }`}
          >
            Annual (Save 40%)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const isAnnual = billingToggle === "annual";
          const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
          const priceId = isAnnual ? tier.annualPriceId : tier.monthlyPriceId;
          const periodLabel = isAnnual ? "/year" : "/mo";

          return (
            <div
              key={tier.name}
              className={`p-6 rounded-2xl border-2 transition-all relative ${
                tier.recommended
                  ? "border-[#134e4a] bg-white shadow-2xl md:-mt-3 md:mb-3"
                  : "border-gray-200 bg-white hover:border-[#134e4a] hover:shadow-xl"
              }`}
            >
              {tier.recommended && (
                <div className="absolute -top-3.5 right-6 bg-[#134e4a] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full">
                  Recommended
                </div>
              )}
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {tier.name}
              </h3>
              <p className="text-gray-500 text-sm mb-4">{tier.description}</p>
              <div className="text-3xl font-extrabold text-[#134e4a] mb-1">
                {price}€
                <span className="text-sm text-gray-400 font-medium">
                  {" "}
                  {periodLabel}
                </span>
              </div>
              {isAnnual && (
                <p className="text-xs text-gray-400 mb-4">
                  {Math.round(tier.annualPrice / 12)}€/mo equivalent
                </p>
              )}
              <ul className="space-y-2.5 mb-6">
                {tier.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <i
                      className="las la-check-circle text-teal-500 text-base shrink-0"
                      aria-hidden
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => handleSubscribe(priceId)}
                disabled={loading !== null}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 ${
                  tier.recommended
                    ? "bg-[#134e4a] text-white hover:bg-[#115e59]"
                    : "border-2 border-[#134e4a] text-[#134e4a] hover:bg-teal-50"
                }`}
              >
                {loading === priceId ? "Redirecting…" : `Choose ${tier.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
