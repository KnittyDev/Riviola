"use client";

import { useState } from "react";
import { DemoStaffSidebar } from "@/components/dashboard/DemoStaffSidebar";

export function DemoLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f6f8f8]">
      <DemoStaffSidebar
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      <div className="fixed top-0 left-0 right-0 h-14 z-40 flex items-center justify-between px-4 bg-amber-50 border-b border-amber-200 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-amber-100 transition-colors"
          aria-label="Open menu"
        >
          <i className="las la-bars text-xl" aria-hidden />
        </button>
        <span className="text-base font-bold text-amber-800">Demo</span>
        <div className="w-10" aria-hidden />
      </div>
      <div className="hidden lg:flex fixed top-0 left-64 right-0 h-12 z-30 items-center px-4 bg-amber-50 border-b border-amber-200">
        <span className="text-sm font-semibold text-amber-800">
          Staff panel demo — data is for display only
        </span>
      </div>
      <main className="flex-1 min-h-screen w-full min-w-0 overflow-x-hidden pt-14 lg:pt-12 lg:pl-64">
        {children}
      </main>
    </div>
  );
}
