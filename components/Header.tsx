import { Link } from "@/i18n/routing";
import Image from "next/image";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { useTranslations } from "next-intl";

export function Header() {
  const t = useTranslations("Navigation");

  const navLinks = [
    { href: "#features", label: t("features") },
    { href: "#pricing", label: t("pricing") },
    { href: "#cta", label: t("contact") },
  ];

  return (
    <header className="fixed top-0 z-[100] w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/mainlogo.png"
            alt="Riviola"
            width={40}
            height={40}
            className="size-10 rounded-xl object-contain shrink-0"
            priority
          />
          <span className="text-xl font-extrabold tracking-tight text-[#134e4a]">
            Riviola
          </span>
        </Link>
        <nav className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-gray-600 hover:text-[#134e4a] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <LocaleSwitcher />
          <div className="h-4 w-[1px] bg-gray-200 mx-1 hidden sm:block" />
          <Link
            href="/login"
            className="px-5 py-2.5 text-sm font-bold text-gray-900 hover:text-[#134e4a] transition-colors"
          >
            {t("signIn")}
          </Link>
          <Link
            href="/onboarding"
            className="px-6 py-2.5 bg-[#134e4a] text-white rounded-full text-sm font-bold shadow-lg shadow-[#134e4a]/20 hover:bg-[#115e59] hover:scale-105 transition-all"
          >
            {t("getStarted")}
          </Link>
        </div>
      </div>
    </header>
  );
}
