"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";

const PRICE_DATA = {
  en: {
    essence: { monthly: 99, annual: 719 },
    signature: { monthly: 149, annual: 999 },
    ultraDeluxe: { monthly: 199, annual: 1299 },
    symbol: "€"
  },
  tr: {
    essence: { monthly: 4000, annual: 28800 },
    signature: { monthly: 5000, annual: 36000 },
    ultraDeluxe: { monthly: 7000, annual: 50400 },
    symbol: "₺"
  }
};

const tiers = [
  {
    id: "essence",
    includedTierId: null,
    variant: "secondary" as const,
    recommended: false,
  },
  {
    id: "signature",
    includedTierId: "essence",
    variant: "primary" as const,
    recommended: true,
  },
  {
    id: "ultraDeluxe",
    includedTierId: "signature",
    variant: "outline" as const,
    recommended: false,
  },
];

export function PricingSection() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const t = useTranslations("Pricing");
  const locale = useLocale() as "en" | "tr";

  const prices = PRICE_DATA[locale] || PRICE_DATA.en;
  const currencySymbol = prices.symbol;

  return (
    <section id="pricing" className="pt-20 pb-32 bg-white overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">
            {t("title")}
          </h2>
          <div className="inline-flex p-1 bg-gray-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-colors ${billing === "monthly"
                ? "bg-white rounded-xl shadow-sm text-[#134e4a]"
                : "text-gray-500 hover:text-[#134e4a]"
                }`}
            >
              {t("billingMonthly")}
            </button>
            <button
              type="button"
              onClick={() => setBilling("annual")}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-colors ${billing === "annual"
                ? "bg-white rounded-xl shadow-sm text-[#134e4a]"
                : "text-gray-500 hover:text-[#134e4a]"
                }`}
            >
              {t("billingAnnual")} <span className="opacity-60">{t("billingAnnualSaving")}</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier) => {
            const isAnnual = billing === "annual";
            const tierPrices = (prices as any)[tier.id];
            const displayPrice = isAnnual
              ? tierPrices.annual
              : tierPrices.monthly;
            const periodText = isAnnual ? t("periodYear") : t("periodMo");

            return (
              <div
                key={tier.id}
                className={`p-8 rounded-[32px] border-2 transition-all relative ${tier.recommended
                  ? "border-[#134e4a] bg-white shadow-2xl md:-mt-4 md:mb-4"
                  : "border-teal-400 bg-[#f9fafb]/50 hover:border-[#134e4a] hover:bg-white hover:shadow-2xl"
                  }`}
              >
                {tier.recommended && (
                  <div className="absolute -top-4 right-8 bg-[#134e4a] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                    {t("tierRecommended")}
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t(`tiers.${tier.id}.name`)}
                </h3>
                <p className="text-gray-500 text-sm mb-4">{t(`tiers.${tier.id}.description`)}</p>
                <div className="text-4xl font-extrabold text-[#134e4a] mb-6">
                  {displayPrice}{currencySymbol}
                  <span className="text-base text-gray-400 font-medium">
                    {" "}{periodText}
                  </span>
                </div>
                {isAnnual && (
                  <p className="text-sm text-gray-500 -mt-4 mb-2">
                    {Math.round(tierPrices.annual / 12)}{currencySymbol}{t("moEquivalent")}
                  </p>
                )}
                <ul className="space-y-4 mb-8">
                  {tier.includedTierId && (
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <i className="las la-check-double text-teal-500 text-lg shrink-0" aria-hidden />
                      <span className="flex-1 font-medium text-gray-700">
                        {t("includedTier", { tier: t(`tiers.${tier.includedTierId}.name`) })}
                      </span>
                    </li>
                  )}
                  {tier.id !== 'essence' && (
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <i className="las la-check-circle text-teal-500 text-lg shrink-0" aria-hidden />
                      <span className="flex-1">{t("fullProcessFeature")}</span>
                      <button
                        type="button"
                        onClick={() => setInfoModalOpen(true)}
                        className="shrink-0 w-5 h-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 animate-pulse hover:animate-none"
                        aria-label="What does full process care mean?"
                        title="More info"
                      >
                        <span className="text-xs font-bold">?</span>
                      </button>
                    </li>
                  )}
                  {(t.raw(`tiers.${tier.id}.features`) as string[]).map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-sm text-gray-600"
                    >
                      <i className="las la-check-circle text-teal-500 text-lg shrink-0" aria-hidden />
                      <span className="flex-1">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={`w-full py-4 rounded-2xl font-bold transition-colors ${tier.variant === "primary"
                    ? "bg-[#134e4a] text-white hover:bg-[#115e59]"
                    : tier.variant === "secondary"
                      ? "bg-black text-white hover:bg-[#1f2937]"
                      : "border-2 border-[#134e4a] text-[#134e4a] hover:bg-teal-50"
                    }`}
                >
                  {t(`tiers.${tier.id}.cta`)}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {infoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="full-process-modal-title"
        >
          <div
            className="absolute inset-0 bg-black/50"
            aria-hidden
            onClick={() => setInfoModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <h3 id="full-process-modal-title" className="text-lg font-bold text-gray-900">
                {t("fullProcessModalTitle")}
              </h3>
              <button
                type="button"
                onClick={() => setInfoModalOpen(false)}
                className="shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                aria-label="Close"
              >
                <i className="las la-times text-xl" aria-hidden />
              </button>
            </div>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              {t("fullProcessModalText")}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
