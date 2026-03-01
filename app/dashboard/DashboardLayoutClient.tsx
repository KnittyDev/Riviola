"use client";

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

  if (isStaff) {
    return (
      <div className="flex min-h-screen bg-[#f6f8f8]">
        <StaffSidebar />
        <main className="flex-1 ml-64 min-h-screen">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f6f8f8]">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen">{children}</main>
    </div>
  );
}
