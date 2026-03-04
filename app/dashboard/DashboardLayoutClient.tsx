"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { StaffSidebar } from "@/components/dashboard/StaffSidebar";

export function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isStaff = pathname?.startsWith("/dashboard/staff");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f6f8f8]">
      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 z-40 flex lg:hidden items-center justify-between h-14 px-4 bg-white border-b border-gray-200">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100"
          aria-label="Open menu"
        >
          <i className="las la-bars text-xl" aria-hidden />
        </button>
        <span className="text-sm font-bold text-gray-900 truncate max-w-[50%]">
          {isStaff ? "Staff" : "Dashboard"}
        </span>
        <div className="w-10" />
      </div>

      {isStaff ? (
        <StaffSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      ) : (
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      <main className="flex-1 min-h-screen w-full pt-14 lg:pt-0 lg:ml-64">
        {children}
      </main>
    </div>
  );
}
