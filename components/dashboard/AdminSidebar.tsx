"use client";

import { Link, usePathname, useRouter } from "@/i18n/routing";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard/admin", labelKey: "overview", icon: "las la-th-large" },
  { href: "/dashboard/admin/companies", labelKey: "companies", icon: "las la-building" },
  { href: "/dashboard/admin/users", labelKey: "users", icon: "las la-users" },
  { href: "/dashboard/admin/withdrawals", labelKey: "withdrawRequests", icon: "las la-hand-holding-usd" },
  { href: "/dashboard/admin/support", labelKey: "supportTickets", icon: "las la-headset" },
  { href: "/dashboard/admin/settings", labelKey: "globalSettings", icon: "las la-cog" },
];

interface AdminSidebarProps {
  fullName?: string;
  open?: boolean;
  onClose?: () => void;
}

const LOGO_SIZE = 40;

export function AdminSidebar({ fullName = "Admin", open = false, onClose }: AdminSidebarProps) {
  const t = useTranslations("Sidebar");
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

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
          <Link href="/dashboard/admin" className="flex items-center gap-3" onClick={onClose}>
            <div className="shrink-0 w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center overflow-hidden">
              <Image
                src="/mainlogo.png"
                alt="Riviola Admin"
                width={LOGO_SIZE}
                height={LOGO_SIZE}
                className="w-full h-full object-contain p-1.5 grayscale invert brightness-0"
                priority
              />
            </div>
            <div>
              <h1 className="text-gray-900 text-base font-bold leading-tight">
                Riviola HQ
              </h1>
              <p className="text-orange-600 text-[10px] font-black uppercase tracking-widest">
                {t("adminPanel")}
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label={t("closeMenu")}
          >
            <i className="las la-times text-xl" aria-hidden />
          </button>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-2 lg:mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard/admin" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive
                    ? "bg-orange-600/10 text-orange-600"
                    : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <i className={`${item.icon} text-lg`} aria-hidden />
                <span className="text-sm font-semibold flex-1 mb-0.5">{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100 space-y-2">
          <div className="flex items-center gap-3 p-2">
            <div className="size-10 rounded-full bg-orange-600/10 flex items-center justify-center shrink-0">
              <span className="text-orange-600 font-bold text-sm">
                {fullName.charAt(0).toUpperCase() || "A"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-gray-900">
                {fullName}
              </p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Super Admin</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-semibold transition-colors"
          >
            <i className="las la-sign-out-alt text-lg" aria-hidden />
            {t("logout")}
          </button>
        </div>
      </aside>
    </>
  );
}
