"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "las la-th-large" },
  { href: "/dashboard/properties", label: "My Properties", icon: "las la-building" },
  { href: "/dashboard/requests", label: "Requests", icon: "las la-tasks" },
  { href: "/dashboard/financials", label: "Financials", icon: "las la-wallet" },
  { href: "/dashboard/fees", label: "Fees & Payments", icon: "las la-receipt" },
  // { href: "/dashboard/documents", label: "Documents", icon: "las la-file-alt" },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
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
          <Link href="/dashboard" className="flex items-center gap-3" onClick={onClose}>
          <div className="bg-[#134e4a] rounded-lg p-2 text-white">
            <i className="las la-city text-xl" aria-hidden />
          </div>
          <div>
            <h1 className="text-gray-900 text-base font-bold leading-tight">
              Riviola
            </h1>
            <p className="text-gray-500 text-xs font-medium">
              Investor Management
            </p>
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
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? "bg-[#134e4a]/10 text-[#134e4a]"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <i className={`${item.icon} text-lg`} aria-hidden />
              <span className="text-sm font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 p-2">
          <div className="size-10 rounded-full bg-gray-200 overflow-hidden relative">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMcPYQbj6EIqkA64ty9wwLMuMOWke1mCjd2zQbl1GTCbBz0Hldg8nseEu5eUgUx1ZTkw23gzZW9S14hOzWDlRN_o8dwtTthv92w-O_jCSRQtsN_VC5WTb9w6K2x7jr6jn3wU6GHjIxiQ1dXQytx23XnM4e00FY2YrIp3BT_aTbFZLr3GdHsVsiW2ZdE_X-K_UerD_ZFTYmoBgWJsUO2aNW_bCeEtQbgRt-KLNwotc8HbVukKTHg46iREk3lC9akDb6BJ1XpMHNT2m3"
              alt="Profile"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate text-gray-900">
              Alex Sterling
            </p>
            <p className="text-xs text-gray-500 truncate">Premium Member</p>
          </div>
          <Link
            href="/dashboard/settings"
            className="p-2 rounded-lg text-gray-400 hover:text-[#134e4a] hover:bg-gray-50 transition-colors"
            aria-label="Profile settings"
          >
            <i className="las la-cog text-sm" aria-hidden />
          </Link>
        </div>
      </div>
    </aside>
    </>
  );
}
