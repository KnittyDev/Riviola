"use client";

import { useState } from "react";

const ANNUAL_DISCOUNT = 0.35; // 35% off when billed annually

const tiers = [
  {
    name: "Essence",
    description: "Perfect for single buildings or small portfolios.",
    monthlyPrice: 109,
    features: [
      "Up to 2 Buildings / Projects",
      "Basic Investor Tracking",
      "Standard Financial Reporting",
      "Document Management",
    ],
    cta: "Choose Essence",
    variant: "secondary" as const,
    recommended: false,
  },
  {
    name: "Signature",
    description: "Optimized for professional property management firms.",
    monthlyPrice: 199,
    features: [
      "Up to 10 Buildings / Projects",
      "Automated Dues Collection",
      "Advanced Financial Analytics",
      "Request & Maintenance Tracking",
      "Investor Portal Access",
    ],
    cta: "Choose Signature",
    variant: "primary" as const,
    recommended: true,
  },
  {
    name: "Ultra Deluxe",
    description: "Enterprise-grade features for large-scale operations.",
    monthlyPrice: 249,
    features: [
      "Unlimited Buildings & Projects",
      "Custom API Integrations",
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

  return (
    <section id="pricing" className="py-32 bg-white overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Investment-Scale Pricing
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
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-sm text-gray-600"
                    >
                      <i className="las la-check-circle text-teal-500 text-lg shrink-0" aria-hidden />
                      {feature}
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
                  {tier.cta}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
