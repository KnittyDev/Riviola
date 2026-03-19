"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const BASE = "/demo/staff";

interface DemoStaffSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function DemoStaffSidebar({ open = false, onClose }: DemoStaffSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("Demo");
  const [personalCompany, setPersonalCompany] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("riviola_demo_company");
    if (saved) setPersonalCompany(saved);
  }, []);

  const displayName = personalCompany || t("companyName");

  const navItems = [
    { href: `${BASE}`, label: t("nav.overview"), icon: "las la-th-large" },
    { href: `${BASE}/buildings`, label: t("nav.buildings"), icon: "las la-building" },
    { href: `${BASE}/investors`, label: t("nav.investors"), icon: "las la-user-friends" },
    { href: `${BASE}/requests`, label: t("nav.requests"), icon: "las la-tasks" },
    { href: `${BASE}/aidat-payments`, label: t("nav.dues"), icon: "las la-receipt" },
    { href: `${BASE}/subscription`, label: t("nav.subscription"), icon: "las la-credit-card" },
  ];

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose?.()}
        aria-hidden
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-64 flex flex-col border-r border-gray-200 bg-white transition-transform duration-200 ease-out lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-4 lg:p-6">
          <Link href={BASE} className="flex items-center gap-3" onClick={onClose}>
            <div className="bg-[#134e4a] rounded-lg p-2 text-white">
              <i className="las la-hard-hat text-xl" aria-hidden />
            </div>
            <div className="min-w-0">
              <h1 className="text-gray-900 text-base font-bold leading-tight truncate max-w-[140px]" title={displayName}>
                {displayName}
              </h1>
              <p className="text-gray-500 text-xs font-medium">{t("label")}</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Close menu"
          >
            <i className="las la-times text-xl" aria-hidden />
          </button>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-2 lg:mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== BASE && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? "bg-[#134e4a]/10 text-[#134e4a]" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <i className={`${item.icon} text-lg`} aria-hidden />
                <span className="text-sm font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <Link
            href="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-semibold transition-colors"
          >
            <i className="las la-arrow-left text-lg" aria-hidden />
            {t("backToLanding")}
          </Link>
        </div>
      </aside>
    </>
  );
}
