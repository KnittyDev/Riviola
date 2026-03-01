import Link from "next/link";

const features = [
  {
    iconClass: "las la-video",
    title: "Live Multi-Feed Streaming",
    description:
      "Aggregate HD streams from across your portfolio into a single, secure command center.",
  },
  {
    iconClass: "las la-university",
    title: "Capital Flow Forecasting",
    description:
      "Automated ledger reconciliation with AI-driven budget overrun predictions and alerts.",
  },
  {
    iconClass: "las la-lock",
    title: "Compliance Vault",
    description:
      "Zero-knowledge encryption for blueprints and contracts with multi-sig approval workflows.",
  },
];

export function FeaturesSection() {
  return (
    <section className="relative bg-[#f9fafb] py-24 overflow-hidden border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Precise Control Over Every Square Inch.
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Our suite of institutional tools provides unmatched granularity for
            complex portfolios.
          </p>
          <Link
            href="#"
            className="inline-flex items-center gap-2 text-[#134e4a] font-bold hover:text-[#115e59] transition-colors group"
          >
            Explore technical specs{" "}
            <i
              className="las la-arrow-right group-hover:translate-x-2 transition-transform"
              aria-hidden
            />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative p-8 rounded-3xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300"
            >
              <div className="size-14 rounded-2xl bg-[#134e4a] flex items-center justify-center mb-6 text-white group-hover:bg-[#115e59] transition-colors">
                <i
                  className={`${feature.iconClass} text-2xl`}
                  aria-hidden
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                {feature.description}
              </p>
              <div className="flex items-center gap-2 text-[#134e4a] font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more{" "}
                <i className="las la-external-link-alt text-xs" aria-hidden />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
