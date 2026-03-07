"use client";

import { useState } from "react";

const ANNUAL_DISCOUNT = 0.35; // 35% off when billed annually

const FULL_PROCESS_FEATURE = "We will take care of the entire process for you.";
const FULL_PROCESS_MODAL_TEXT =
  "We manage and take responsibility for the entire process on your behalf. We handle all documentation for your construction projects, register investors, buyers, and renters, and communicate with investors. We take care of all issues. We manage the maintenance fees for apartment buildings and residential units.";

const tiers = [
  {
    name: "Essence",
    description: "Perfect for single buildings or small portfolios.",
    monthlyPrice: 109,
    includedTierName: null as string | null,
    features: [
      "Up to 2 Buildings / Projects",
      "Basic Investor Tracking",
      "Document Management",
      "Basic Financial Reporting",
      "Standard Financial Reporting",
      "Investor Portal Access",
      "We manage 50% of the process.",
      "0% commission on all payments made and transferred",
    ],
    cta: "Choose Essence",
    variant: "secondary" as const,
    recommended: false,
  },
  {
    name: "Signature",
    description: "Optimized for professional property management firms.",
    monthlyPrice: 199,
    includedTierName: "Essence",
    features: [
      "We will take care of the entire process for you.",
      "Up to 10 Buildings / Projects",
      "Automated Dues Collection",
      "Advanced Financial Analytics",
      "Auto Invoice Generation",
      "Request & Maintenance Tracking",
    ],
    cta: "Choose Signature",
    variant: "primary" as const,
    recommended: true,
  },
  {
    name: "Ultra Deluxe",
    description: "Enterprise-grade features for large-scale operations.",
    monthlyPrice: 249,
    includedTierName: "Signature",
    features: [
      "We will take care of the entire process for you.",
      "Unlimited Buildings & Projects",
      "Full Customization",
      "Priority Support & Dedicated Manager",
      "White-label Investor Reports",
      "Bulk Payment Processing",
    ],
    cta: "Choose Ultra Deluxe",
    variant: "outline" as const,
    recommended: false,
  },
];

export function PricingSection() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  return (
    <section id="pricing" className="py-32 bg-white overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Pricing
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
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBilling("annual")}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-colors ${billing === "annual"
                ? "bg-white rounded-xl shadow-sm text-[#134e4a]"
                : "text-gray-500 hover:text-[#134e4a]"
                }`}
            >
              Annual (Save 35%)
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier) => {
            const isAnnual = billing === "annual";
            const displayPrice = isAnnual
              ? Math.round(tier.monthlyPrice * (1 - ANNUAL_DISCOUNT))
              : tier.monthlyPrice;
            const periodText = isAnnual ? "/mo, billed annually" : "/mo";

            return (
              <div
                key={tier.name}
                className={`p-8 rounded-[32px] border-2 transition-all relative ${tier.recommended
                  ? "border-[#134e4a] bg-white shadow-2xl md:-mt-4 md:mb-4"
                  : "border-teal-400 bg-[#f9fafb]/50 hover:border-[#134e4a] hover:bg-white hover:shadow-2xl"
                  }`}
              >
                {tier.recommended && (
                  <div className="absolute -top-4 right-8 bg-[#134e4a] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                    Recommended
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {tier.name}
                </h3>
                <p className="text-gray-500 text-sm mb-4">{tier.description}</p>
                <div className="text-4xl font-extrabold text-[#134e4a] mb-6">
                  {displayPrice}€
                  <span className="text-base text-gray-400 font-medium">
                    {" "}{periodText}
                  </span>
                </div>
                {isAnnual && (
                  <p className="text-sm text-gray-500 -mt-4 mb-2">
                    {Math.round(tier.monthlyPrice * 12 * (1 - ANNUAL_DISCOUNT))}€ total per year
                  </p>
                )}
                <ul className="space-y-4 mb-8">
                  {tier.includedTierName && (
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <i className="las la-check-double text-teal-500 text-lg shrink-0" aria-hidden />
                      <span className="flex-1 font-medium text-gray-700">
                        All {tier.includedTierName} features included
                      </span>
                    </li>
                  )}
                  {tier.features.map((feature) => {
                    const isFullProcess = feature === FULL_PROCESS_FEATURE;
                    return (
                      <li
                        key={feature}
                        className="flex items-center gap-3 text-sm text-gray-600"
                      >
                        <i className="las la-check-circle text-teal-500 text-lg shrink-0" aria-hidden />
                        <span className="flex-1">{feature}</span>
                        {isFullProcess && (
                          <button
                            type="button"
                            onClick={() => setInfoModalOpen(true)}
                            className="shrink-0 w-5 h-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 animate-pulse hover:animate-none"
                            aria-label="What does full process care mean?"
                            title="More info"
                          >
                            <span className="text-xs font-bold">?</span>
                          </button>
                        )}
                      </li>
                    );
                  })}
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
                  {tier.cta}
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
                Full process care
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
              {FULL_PROCESS_MODAL_TEXT}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
