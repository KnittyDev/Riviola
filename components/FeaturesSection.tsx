import Link from "next/link";

const features = [
  {
    iconClass: "las la-building",
    title: "Properties Hub",
    description:
      "Manage units, leases and availability from a single centralized dashboard.",
  },
  {
    iconClass: "las la-user-friends",
    title: "Investor Portal",
    description:
      "Track investor profiles, allocations and distributions with clear audit trails.",
  },
  {
    iconClass: "las la-receipt",
    title: "Dues & Payments",
    description:
      "Automate invoices, collections, installments and reconciliation workflows.",
  },
  {
    iconClass: "las la-file-contract",
    title: "Documents & Compliance",
    description:
      "Securely store blueprints, contracts and approvals with granular access controls.",
  },
  {
    iconClass: "las la-chart-line",
    title: "Financial Insights",
    description:
      "Real-time P&L, cashflow views and customizable reports for stakeholders.",
  },
  {
    iconClass: "las la-tools",
    title: "Requests & Maintenance",
    description:
      "Collect tenant requests, dispatch staff and track resolution progress.",
  },
  {
    iconClass: "las la-camera-retro",
    title: "Photo Updates",
    description:
      "Schedule and deliver weekly property photo updates to stakeholders.",
  },
  {
    iconClass: "las la-credit-card",
    title: "Billing & Subscriptions",
    description:
      "Flexible billing, subscription controls and payment history at a glance.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative bg-gradient-to-b from-white via-[#fbfcfd] to-[#f9fafb] py-24 overflow-hidden border-y border-gray-100 scroll-mt-20">
      <div className="absolute -left-16 -top-10 w-72 h-72 bg-gradient-to-tr from-[#d1fae5] to-[#ecfeff] opacity-30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-0 -bottom-20 w-96 h-96 bg-gradient-to-br from-[#eef2ff] to-[#fff7ed] opacity-20 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Everything you need to run properties — simplified.
          </h2>
          <p className="text-gray-600 text-base md:text-lg mb-6">
            From tenant requests to investor reporting, a cohesive toolset built
            to streamline operations and surface the insights you need.
          </p>
          <Link href="/demo" className="inline-flex items-center gap-3 bg-[#134e4a] text-white px-5 py-3 rounded-full font-semibold shadow-sm hover:shadow-md transition-all">
            Try the demo
            <i className="las la-arrow-right text-sm" aria-hidden />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative p-6 rounded-2xl bg-white border border-gray-100 transform hover:-translate-y-1 hover:scale-101 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-[#134e4a] flex items-center justify-center mb-4 text-white group-hover:bg-[#0f5b55] transition-colors">
                <i className={`${feature.iconClass} text-2xl`} aria-hidden />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
