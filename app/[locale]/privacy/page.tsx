import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getTranslations, getLocale } from "next-intl/server";

export default async function PrivacyPage() {
  const t = await getTranslations("Privacy");
  const locale = await getLocale();
  const resolvedLocale = locale === "tr" ? "tr-TR" : "en-GB";

  return (
    <>
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#134e4a] mb-8"
          >
            <i className="las la-arrow-left" aria-hidden />
            {t("backToHome")}
          </Link>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            {t("title")}
          </h1>
          <p className="text-gray-500 mt-2">
            {t("lastUpdated")} {new Date().toLocaleDateString(resolvedLocale, { day: "numeric", month: "long", year: "numeric" })}
          </p>

          <div className="prose prose-gray mt-12 space-y-10">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t("s1title")}</h2>
              <p className="text-gray-600 leading-relaxed">{t("s1body")}</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t("s2title")}</h2>
              <p className="text-gray-600 leading-relaxed mb-4">{t("s2body")}</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t("s3title")}</h2>
              <p className="text-gray-600 leading-relaxed">{t("s3body")}</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t("s4title")}</h2>
              <p className="text-gray-600 leading-relaxed">{t("s4body")}</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t("s5title")}</h2>
              <p className="text-gray-600 leading-relaxed">{t("s5body")}</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t("s6title")}</h2>
              <p className="text-gray-600 leading-relaxed">{t("s6body")}</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
