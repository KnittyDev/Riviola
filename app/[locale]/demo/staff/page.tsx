"use client";
import Link from "next/link";
import { staffBuildings } from "@/lib/staffBuildingsData";
import { staffRequests } from "@/lib/staffRequestsData";
import { StaffPerformanceChart } from "@/components/dashboard/staff/StaffPerformanceChart";
import { CriticalAlerts } from "@/components/dashboard/staff/CriticalAlerts";
import { ActiveProjectsSection } from "@/components/dashboard/staff/ActiveProjectsSection";
import { useTranslations } from "next-intl";

export default function StaffPage() {
  const t = useTranslations("Demo.staff");

  const pendingRequests = staffRequests.filter(r => r.status === "Pending").slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Link
          href="/demo/staff/weekly-photos/new"
          className="group flex items-center gap-4 p-6 rounded-2xl border-2 border-[#134e4a] bg-[#134e4a] text-white hover:bg-[#115e59] hover:border-[#115e59] transition-colors"
        >
          <div className="size-14 rounded-xl bg-white/20 flex items-center justify-center">
            <i className="las la-camera text-2xl" aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-bold">{t("actions.addPhoto.title")}</h2>
            <p className="text-sm text-white/90 mt-0.5">
              {t("actions.addPhoto.description")}
            </p>
          </div>
          <i className="las la-plus-circle text-2xl ml-auto opacity-80 group-hover:opacity-100" aria-hidden />
        </Link>
        <Link
          href="/demo/staff/investors/new"
          className="group flex items-center gap-4 p-6 rounded-2xl border-2 border-gray-200 bg-white hover:border-[#134e4a] hover:bg-[#134e4a]/5 transition-colors"
        >
          <div className="size-14 rounded-xl bg-[#134e4a]/10 flex items-center justify-center text-[#134e4a]">
            <i className="las la-user-plus text-2xl" aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{t("actions.createAccount.title")}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {t("actions.createAccount.description")}
            </p>
          </div>
          <i className="las la-arrow-right text-xl text-gray-400 ml-auto group-hover:text-[#134e4a]" aria-hidden />
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          {t("overview.title")}
        </h1>
        <p className="text-gray-500 mt-1">
          {t("overview.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            {t("overview.stats.buildings")}
          </p>
          <p className="text-2xl font-extrabold text-gray-900">3</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            {t("overview.stats.activeProjects")}
          </p>
          <p className="text-2xl font-extrabold text-[#134e4a]">2</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            {t("overview.stats.completed")}
          </p>
          <p className="text-2xl font-extrabold text-emerald-600">1</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            {t("overview.stats.investors")}
          </p>
          <p className="text-2xl font-extrabold text-gray-900">44</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-2">
        <div className="lg:col-span-8 min-h-[320px]">
          <StaffPerformanceChart />
        </div>
        <div className="lg:col-span-4 min-h-[320px]">
          <CriticalAlerts
            pendingRequests={pendingRequests}
            recentPayments={[
              {
                id: "rp1",
                buildingName: "Avala Resort",
                unit: "A-12",
                period: "Sept 2024",
                paid_at: new Date().toISOString(),
                investorName: "John Doe"
              },
              {
                id: "rp2",
                buildingName: "Skyline Plaza",
                unit: "10B",
                period: "Oct 2024",
                paid_at: new Date(Date.now() - 86400000).toISOString(),
                investorName: "Alice Smith"
              }
            ]}
            overdueDues={[
              {
                id: "od1",
                buildingName: "Avala Resort",
                unit: "C-04",
                period: "Oct 2024",
                dueDate: "2024-10-05",
                investorName: "Marko Nikolic"
              },
              {
                id: "od2",
                buildingName: "Horizon Towers",
                unit: "1502",
                period: "Nov 2024",
                dueDate: "2024-11-05",
                investorName: "Sarah Connor"
              }
            ]}
          />
        </div>
      </div>

      <ActiveProjectsSection
        basePath="/demo/staff"
        buildings={staffBuildings.map(b => ({
          id: b.id,
          name: b.name,
          location: b.location,
          status: b.status,
          progress: b.progress,
          image_url: b.imageUrl
        }))}
      />
    </div>
  );
}
