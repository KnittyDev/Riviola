"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "las la-th-large" },
  { href: "/dashboard/properties", label: "My Properties", icon: "las la-building" },
  { href: "/dashboard/financials", label: "Financials", icon: "las la-wallet" },
  { href: "/dashboard/fees", label: "Fees & Payments", icon: "las la-receipt" },
  // { href: "/dashboard/documents", label: "Documents", icon: "las la-file-alt" },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open = true, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={`relative w-64 max-w-[85vw] border-r border-gray-200 bg-white flex flex-col fixed left-0 top-0 h-full z-50 transition-transform duration-200 ease-out lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3">
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
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
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
      {/* Mobile: close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
        aria-label="Close menu"
      >
        <i className="las la-times text-xl" aria-hidden />
      </button>
    </aside>
    </>
  );
}
