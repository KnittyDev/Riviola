"use client";
import Link from "next/link";
import { InvestorsTable } from "@/components/dashboard/staff/InvestorsTable";
import { demoInvestors } from "@/lib/demoInvestorsData";
import { useTranslations } from "next-intl";

export default function StaffInvestorsPage() {
  const t = useTranslations("Demo.investors");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          {t("title")}
        </h1>
        <Link
          href="/demo/staff/investors/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#134e4a] text-white text-sm font-semibold hover:bg-[#115e59] transition-colors shrink-0"
        >
          <i className="las la-user-plus" aria-hidden />
          {t("create")}
        </Link>
      </div>

      <InvestorsTable rows={demoInvestors} />
    </div>
  );
}
