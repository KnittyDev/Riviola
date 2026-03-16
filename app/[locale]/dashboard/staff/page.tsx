import Link from "next/link";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getStaffCompanyId } from "@/lib/buildings";
import { redirect } from "next/navigation";
import { StaffPerformanceChart } from "@/components/dashboard/staff/StaffPerformanceChart";
import { CriticalAlerts } from "@/components/dashboard/staff/CriticalAlerts";
import { ActiveProjectsSection } from "@/components/dashboard/staff/ActiveProjectsSection";
import { getStaffRecentDuesPayments, getStaffOverdueDues } from "@/lib/duesPayments";
import type { Building } from "@/lib/supabase/types";
import { getCompanyInvestorProperties } from "@/lib/companyInvestors";
import { getTranslations } from "next-intl/server";

export default async function StaffPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("Staff");
  const supabase = await createClient();
  const companyId = await getStaffCompanyId(supabase);
  if (!companyId) redirect("/dashboard/staff");

  const { data: buildings } = await supabase
    .from("buildings")
    .select("id, name, location, status, progress, image_url")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  const list = (buildings ?? []) as Pick<Building, "id" | "name" | "location" | "status" | "progress" | "image_url">[];
  const activeCount = list.filter((b) => b.status === "In progress").length;
  const completedCount = list.filter((b) => b.status === "Completed").length;

  const serviceClient = createServiceRoleClient();

  const [recentPayments, overdueDues, investorProperties] = await Promise.all([
    getStaffRecentDuesPayments(supabase, companyId, 10),
    getStaffOverdueDues(supabase, companyId, 20),
    getCompanyInvestorProperties(serviceClient, companyId),
  ]);

  const totalInvestorsCount = new Set(investorProperties.map(p => p.profile_id)).size;

  // Build a time-series of investor portfolio value (EUR) based on when units were registered
  const byMonth = new Map<string, number>(); // key = YYYY-MM
  for (const row of investorProperties) {
    if (
      row.purchase_value != null &&
      row.purchase_value >= 0 &&
      row.purchase_currency &&
      row.created_at
    ) {
      const currency = row.purchase_currency.trim() || "EUR";
      // Only aggregate EUR for now so the chart is in a single currency
      if (currency !== "EUR") continue;
      const d = new Date(row.created_at);
      if (Number.isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      byMonth.set(key, (byMonth.get(key) ?? 0) + row.purchase_value);
    }
  }

  const sortedKeys = Array.from(byMonth.keys()).sort();

  let performanceData: { label: string; value: number }[] = [];
  if (sortedKeys.length > 0) {
    // Build cumulative values for all months where purchases happened
    const cumulativeByKey = new Map<string, number>();
    let cumulative = 0;
    for (const key of sortedKeys) {
      cumulative += byMonth.get(key) ?? 0;
      cumulativeByKey.set(key, cumulative);
    }

    // Build a 3‑month window: current month and previous 2 months
    const now = new Date();
    const months: Date[] = [];
    const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    for (let i = 0; i < 3; i++) {
      months.push(new Date(start.getFullYear(), start.getMonth() + i, 1));
    }

    performanceData = months.map((d) => {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      // Find the latest purchase month <= this key
      let value = 0;
      for (let i = sortedKeys.length - 1; i >= 0; i--) {
        const k = sortedKeys[i];
        if (k <= key) {
          value = cumulativeByKey.get(k) ?? 0;
          break;
        }
      }
      const label = d
        .toLocaleDateString(locale === "tr" ? "tr-TR" : "en-GB", {
          month: "short",
          year: "2-digit",
        })
        .toUpperCase();
      return { label, value };
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Link
          href="/dashboard/staff/weekly-photos/new"
          className="group flex items-center gap-4 p-6 rounded-2xl border-2 border-[#134e4a] bg-[#134e4a] text-white hover:bg-[#115e59] hover:border-[#115e59] transition-colors"
        >
          <div className="size-14 rounded-xl bg-white/20 flex items-center justify-center">
            <i className="las la-camera text-2xl" aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-bold">{t("addPhoto")}</h2>
            <p className="text-sm text-white/90 mt-0.5">
              {t("addPhotoSubtitle")}
            </p>
          </div>
          <i className="las la-plus-circle text-2xl ml-auto opacity-80 group-hover:opacity-100" aria-hidden />
        </Link>
        <Link
          href="/dashboard/staff/investors/new"
          className="group flex items-center gap-4 p-6 rounded-2xl border-2 border-gray-200 bg-white hover:border-[#134e4a] hover:bg-[#134e4a]/5 transition-colors"
        >
          <div className="size-14 rounded-xl bg-[#134e4a]/10 flex items-center justify-center text-[#134e4a]">
            <i className="las la-user-plus text-2xl" aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{t("createInvestor")}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {t("createInvestorSubtitle")}
            </p>
          </div>
          <i className="las la-arrow-right text-xl text-gray-400 ml-auto group-hover:text-[#134e4a]" aria-hidden />
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          {t("overview")}
        </h1>
        <p className="text-gray-500 mt-1">
          {t("overviewSubtitle")}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            {t("stats.buildings")}
          </p>
          <p className="text-2xl font-extrabold text-gray-900">{list.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            {t("stats.activeProjects")}
          </p>
          <p className="text-2xl font-extrabold text-[#134e4a]">{activeCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            {t("stats.completed")}
          </p>
          <p className="text-2xl font-extrabold text-emerald-600">{completedCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            {t("stats.investorAccounts")}
          </p>
          <p className="text-2xl font-extrabold text-gray-900">{totalInvestorsCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-2">
        <div className="lg:col-span-8 min-h-[320px]">
          <StaffPerformanceChart data={performanceData} />
        </div>
        <div className="lg:col-span-4 min-h-[320px]">
          <CriticalAlerts recentPayments={recentPayments} overdueDues={overdueDues} />
        </div>
      </div>

      <ActiveProjectsSection buildings={list} />
    </div>
  );
}
