"use client";

import { FinancialsProgressCard } from "@/components/dashboard/financials/FinancialsProgressCard";
import { MilestonesTable } from "@/components/dashboard/financials/MilestonesTable";

export default function FinancialsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Page title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 animate-fade-in">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            Financials & Installments
          </h1>
          <p className="text-gray-500 text-base">
            Track payment milestones and outstanding balances for{" "}
            <span className="font-semibold text-[#134e4a]">Project Alpha</span>.
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <i className="las la-download text-lg" aria-hidden />
          Export Report
        </button>
      </div>

      <div className="flex flex-col gap-8">
        <FinancialsProgressCard />
        <MilestonesTable />
      </div>
    </div>
  );
}
