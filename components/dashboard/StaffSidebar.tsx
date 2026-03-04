"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const companyName = "Example Construction";

const navItems = [
  { href: "/dashboard/staff", label: "Overview", icon: "las la-th-large" },
  { href: "/dashboard/staff/buildings", label: "Buildings", icon: "las la-building" },
  { href: "/dashboard/staff/investors", label: "Investors", icon: "las la-user-friends" },
  { href: "/dashboard/staff/requests", label: "Requests", icon: "las la-tasks" },
  { href: "/dashboard/staff/aidat-payments", label: "Dues Payments", icon: "las la-receipt" },
  { href: "/dashboard/staff/subscription", label: "Subscription", icon: "las la-credit-card" },
];

interface StaffSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function StaffSidebar({ open = true, onClose }: StaffSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={`w-64 max-w-[85vw] border-r border-gray-200 bg-white flex flex-col fixed left-0 top-0 h-full z-50 transition-transform duration-200 ease-out lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
      <div className="p-6">
        <Link href="/dashboard/staff" className="flex items-center gap-3">
          <div className="bg-[#134e4a] rounded-lg p-2 text-white">
            <i className="las la-hard-hat text-xl" aria-hidden />
          </div>
          <div>
            <h1 className="text-gray-900 text-base font-bold leading-tight">
              {companyName}
            </h1>
            <p className="text-gray-500 text-xs font-medium">
              Company panel
            </p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard/staff" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive
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
        <button
          type="button"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-semibold transition-colors"
        >
          <i className="las la-sign-out-alt text-lg" aria-hidden />
          Logout
        </button>
      </div>
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
