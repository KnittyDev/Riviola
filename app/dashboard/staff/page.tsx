import Link from "next/link";
import Image from "next/image";
import { staffBuildings } from "@/lib/staffBuildingsData";
import { StaffPerformanceChart } from "@/components/dashboard/staff/StaffPerformanceChart";
import { CriticalAlerts } from "@/components/dashboard/staff/CriticalAlerts";
import { ActiveProjectsSection } from "@/components/dashboard/staff/ActiveProjectsSection";

export default function StaffPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Link
          href="/dashboard/staff/weekly-photos/new"
          className="group flex items-center gap-4 p-6 rounded-2xl border-2 border-[#134e4a] bg-[#134e4a] text-white hover:bg-[#115e59] hover:border-[#115e59] transition-colors"
        >
          <div className="size-14 rounded-xl bg-white/20 flex items-center justify-center">
            <i className="las la-camera text-2xl" aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-bold">Add weekly photo</h2>
            <p className="text-sm text-white/90 mt-0.5">
              Upload weekly progress photos for projects.
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
            <h2 className="text-lg font-bold text-gray-900">Create investor account</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Create login accounts for investors.
            </p>
          </div>
          <i className="las la-arrow-right text-xl text-gray-400 ml-auto group-hover:text-[#134e4a]" aria-hidden />
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Overview
        </h1>
        <p className="text-gray-500 mt-1">
          Manage your buildings and create investor accounts.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Buildings
          </p>
          <p className="text-2xl font-extrabold text-gray-900">3</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Active projects
          </p>
          <p className="text-2xl font-extrabold text-[#134e4a]">2</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Completed
          </p>
          <p className="text-2xl font-extrabold text-emerald-600">1</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Investor accounts
          </p>
          <p className="text-2xl font-extrabold text-gray-900">—</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-2">
        <div className="lg:col-span-8 min-h-[320px]">
          <StaffPerformanceChart />
        </div>
        <div className="lg:col-span-4 min-h-[320px]">
          <CriticalAlerts />
        </div>
      </div>

      <ActiveProjectsSection />
    </div>
  );
}
