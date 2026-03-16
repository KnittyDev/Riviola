import { Link } from "@/i18n/routing";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations("Footer");

  const productLinks = [
    { href: "/#features", label: t("links.features") },
    { href: "/#pricing", label: t("links.pricing") },
    { href: "/demo", label: t("links.demo") },
    { href: "/onboarding", label: t("links.getStarted") },
  ];

  const legalLinks = [
    { href: "/privacy", label: t("links.privacy") },
    { href: "/terms", label: t("links.terms") },
    { href: "/cookies", label: t("links.cookies") },
  ];

  const accountLinks = [
    { href: "/login", label: t("links.signIn") },
    { href: "/#cta", label: t("links.contact") },
  ];

  return (
    <footer className="bg-[#f9fafb] py-16 lg:py-20 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-14">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 mb-5">
              <Image
                src="/mainlogo.png"
                alt="Riviola"
                width={36}
                height={36}
                className="size-9 rounded-xl object-contain shrink-0"
              />
              <span className="text-lg font-extrabold tracking-tight text-[#134e4a]">
                Riviola
              </span>
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed max-w-xs">
              {t("subtitle")}
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-5">
              {t("product")}
            </h4>
            <ul className="space-y-3 text-sm text-gray-600">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-[#134e4a] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-5">
              {t("legal")}
            </h4>
            <ul className="space-y-3 text-sm text-gray-600">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-[#134e4a] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-5">
              {t("account")}
            </h4>
            <ul className="space-y-3 text-sm text-gray-600">
              {accountLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-[#134e4a] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-gray-200 gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Riviola. {t("rights")}
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-[#134e4a] transition-colors">
              {t("links.privacyShort")}
            </Link>
            <Link href="/terms" className="hover:text-[#134e4a] transition-colors">
              {t("links.termsShort")}
            </Link>
            <Link href="/cookies" className="hover:text-[#134e4a] transition-colors">
              {t("links.cookiesShort")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
