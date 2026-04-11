import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";

const features = [
  { id: "hub", iconClass: "las la-building", size: "large", gradient: "from-emerald-500/10 to-teal-500/10" },
  { id: "investor", iconClass: "las la-user-friends", size: "medium", gradient: "from-blue-500/10 to-indigo-500/10" },
  { id: "payments", iconClass: "las la-receipt", size: "medium", gradient: "from-amber-500/10 to-orange-500/10" },
  { id: "sustainability", iconClass: "las la-leaf", size: "small" },
  { id: "requests", iconClass: "las la-clipboard-list", size: "small" },
  { id: "docs", iconClass: "las la-file-contract", size: "small" },
  { id: "insights", iconClass: "las la-chart-line", size: "small" },
  { id: "photos", iconClass: "las la-camera-retro", size: "small" },
];

export async function FeaturesSection() {
  const t = await getTranslations("Features");

  return (
    <section id="features" className="relative bg-[#fcfdfe] pt-32 pb-20 overflow-hidden border-y border-gray-100 scroll-mt-20">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#d1fae5] opacity-20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#eef2ff] opacity-20 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
              {t.rich("title", {
                gradient: (chunks) => <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#134e4a] to-[#115e59]">{chunks}</span>
              })}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              {t("subtitle")}
            </p>
          </div>
          <Link href="/demo" className="shrink-0 group flex items-center gap-3 bg-[#134e4a] text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-[#134e4a]/10 hover:shadow-2xl hover:shadow-[#134e4a]/20 hover:-translate-y-1 transition-all">
            {t("cta")}
            <i className="las la-arrow-right group-hover:translate-x-1 transition-transform" aria-hidden />
          </Link>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 md:gap-6 min-h-[auto] md:min-h-[800px]">
          {/* Main Feature - Hub (Span 2x2) */}
          <div className="md:col-span-2 md:row-span-2 group relative p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col justify-between overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${features[0].gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-3xl bg-[#134e4a] flex items-center justify-center mb-8 text-white shadow-lg shadow-[#134e4a]/20 transform group-hover:rotate-6 transition-transform duration-500">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M2.5 0.5V0H3.5V0.5C3.5 1.60457 4.39543 2.5 5.5 2.5H6V3V3.5H5.5C4.39543 3.5 3.5 4.39543 3.5 5.5V6H3H2.5V5.5C2.5 4.39543 1.60457 3.5 0.5 3.5H0V3V2.5H0.5C1.60457 2.5 2.5 1.60457 2.5 0.5Z" />
                  <path d="M14.5 4.5V5H13.5V4.5C13.5 3.94772 13.0523 3.5 12.5 3.5H12V3V2.5H12.5C13.0523 2.5 13.5 2.05228 13.5 1.5V1H14H14.5V1.5C14.5 2.05228 14.9477 2.5 15.5 2.5H16V3V3.5H15.5C14.9477 3.5 14.5 3.94772 14.5 4.5Z" />
                  <path d="M8.40706 4.92939L8.5 4H9.5L9.59294 4.92939C9.82973 7.29734 11.7027 9.17027 14.0706 9.40706L15 9.5V10.5L14.0706 10.5929C11.7027 10.8297 9.82973 12.7027 9.59294 15.0706L9.5 16H8.5L8.40706 15.0706C8.17027 12.7027 6.29734 10.8297 3.92939 10.5929L3 10.5V9.5L3.92939 9.40706C6.29734 9.17027 8.17027 7.29734 8.40706 4.92939Z" />
                </svg>
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-4">{t("items.hub.title")}</h3>
              <p className="text-gray-600 text-xl leading-relaxed max-w-sm">{t("items.hub.description")}</p>
            </div>
            <div className="relative z-10 pt-12 flex items-center gap-2 text-[#134e4a] font-bold group-hover:gap-4 transition-all">
              {t("seeHowItWorks")} <i className="las la-arrow-right" />
            </div>
          </div>

          {/* Medium Feature - Investor (Span 2x1) */}
          <div className="md:col-span-2 group relative p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col sm:flex-row items-start gap-6 md:gap-8 overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${features[1].gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="relative z-10 w-16 h-16 shrink-0 rounded-2xl bg-[#134e4a]/10 flex items-center justify-center text-[#134e4a]">
              <i className={`${features[1].iconClass} text-3xl`} aria-hidden />
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t("items.investor.title")}</h3>
              <p className="text-gray-500 text-base leading-relaxed">{t("items.investor.description")}</p>
            </div>
          </div>

          {/* Medium Feature - Payments (Span 2x1) */}
          <div className="md:col-span-2 group relative p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col sm:flex-row items-start gap-6 md:gap-8 overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${features[2].gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="relative z-10 w-16 h-16 shrink-0 rounded-2xl bg-[#134e4a]/10 flex items-center justify-center text-[#134e4a]">
              <i className={`${features[2].iconClass} text-3xl`} aria-hidden />
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t("items.payments.title")}</h3>
              <p className="text-gray-500 text-base leading-relaxed">{t("items.payments.description")}</p>
            </div>
          </div>

          {/* Small Features Row */}
          <div className="md:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mt-0 md:mt-4">
            {features.slice(3).map((feature) => (
              <div
                key={feature.id}
                className="group p-6 rounded-[1.5rem] bg-white border border-gray-100 hover:border-[#134e4a]/20 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-4 text-[#134e4a] group-hover:bg-[#134e4a] group-hover:text-white transition-all duration-300">
                  <i className={`${feature.iconClass} text-2xl`} aria-hidden />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{t(`items.${feature.id}.title`)}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{t(`items.${feature.id}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
