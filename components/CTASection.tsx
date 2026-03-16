import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";

export async function CTASection() {
  const t = await getTranslations("CTA");

  return (
    <section id="cta" className="w-full bg-white py-16 mb-24 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-8 md:px-12 lg:px-20">
        <div className="relative rounded-[48px] bg-[#134e4a] py-24 px-12 text-center">
          <div className="absolute inset-0 grainy-overlay" />
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute -top-1/2 -left-1/4 w-[600px] h-[600px] bg-teal-500/20 rounded-full blur-[120px]" />
            <div className="absolute -bottom-1/2 -right-1/4 w-[600px] h-[600px] bg-black/40 rounded-full blur-[120px]" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-8 tracking-tight">
              {t("title")}
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/onboarding"
                className="h-16 px-10 rounded-2xl bg-white text-[#134e4a] font-extrabold text-lg shadow-xl shadow-black/20 hover:scale-105 transition-transform flex items-center justify-center"
              >
                {t("buttonConsultation")}
              </Link>
              <Link
                href="/onboarding"
                className="h-16 px-10 rounded-2xl bg-teal-800 text-white font-extrabold text-lg border border-teal-700 hover:bg-teal-700 transition-colors flex items-center justify-center"
              >
                {t("buttonTrial")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
