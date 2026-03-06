"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { StaffSidebar } from "@/components/dashboard/StaffSidebar";

export function DashboardLayoutClient({
  children,
  role = "investor",
  investorType = null,
  companyName = "Company",
  companyLogoUrl = null,
  fullName = "Staff",
  avatarUrl = null,
  email = null,
}: {
  children: React.ReactNode;
  role?: "investor" | "staff" | "admin";
  investorType?: "renter" | "buyer" | null;
  companyName?: string;
  companyLogoUrl?: string | null;
  fullName?: string;
  avatarUrl?: string | null;
  email?: string | null;
}) {
  const pathname = usePathname();
  const isStaff = pathname?.startsWith("/dashboard/staff") && (role === "staff" || role === "admin");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f6f8f8]">
      {isStaff ? (
        <StaffSidebar
          companyName={companyName}
          companyLogoUrl={companyLogoUrl}
          fullName={fullName}
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
      ) : (
        <Sidebar
          fullName={fullName}
          avatarUrl={avatarUrl}
          email={email}
          investorType={investorType}
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
      )}
      {/* Mobile top bar: hamburger + title */}
      <div className="fixed top-0 left-0 right-0 h-14 z-40 flex items-center justify-between px-4 bg-white border-b border-gray-200 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Open menu"
        >
          <i className="las la-bars text-xl" aria-hidden />
        </button>
        <span className="text-base font-bold text-gray-900 truncate max-w-[180px]">
          {isStaff ? companyName : "Dashboard"}
        </span>
        <div className="w-10" aria-hidden />
      </div>
      <main className="flex-1 min-h-screen w-full min-w-0 overflow-x-hidden pt-14 lg:pt-0 lg:ml-64">
        {children}
      </main>
    </div>
  );
}
