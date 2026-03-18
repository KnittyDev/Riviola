"use client";
import Link from "next/link";
import Image from "next/image";
import { staffBuildings } from "@/lib/staffBuildingsData";
import { BuildingListMetaClient } from "./BuildingListMetaClient";
import type { BuildingStatus } from "@/lib/staffBuildingOverrides";
import { useTranslations } from "next-intl";

export default function StaffBuildingsPage() {
  const t = useTranslations("Demo.buildings");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{t("title")}</h1>
        <Link
          href="/demo/staff/weekly-photos/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#134e4a] text-white text-sm font-semibold hover:bg-[#115e59] transition-colors"
        >
          <i className="las la-camera" aria-hidden />
          {t("addPhoto")}
        </Link>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {staffBuildings.map((b) => (
            <li key={b.id} className="px-6 py-4 hover:bg-gray-50/80 transition-colors flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <Link
                href={`/demo/staff/buildings/${b.id}`}
                className="flex flex-1 min-w-0 items-center gap-4"
              >
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                  <Image
                    src={b.imageUrl}
                    alt={b.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 hover:text-[#134e4a]">{b.name}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                    <i className="las la-map-marker-alt text-gray-400" aria-hidden />
                    {b.location} · {t("units", { count: b.units })}
                  </p>
                </div>
              </Link>
              <div className="flex items-center gap-4 shrink-0 sm:pl-2">
                <BuildingListMetaClient
                  buildingId={b.id}
                  fallbackProgress={b.progress}
                  fallbackStatus={b.status as BuildingStatus}
                />
                <div className="flex items-center gap-2">
                  <Link
                    href={`/demo/staff/buildings/${b.id}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#134e4a] text-white text-sm font-semibold hover:bg-[#115e59] transition-colors shadow-sm"
                  >
                    <i className="las la-eye text-sm" aria-hidden />
                    {t("see")}
                  </Link>
                  <Link
                    href={`/demo/staff/buildings/${b.id}/edit`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:border-[#134e4a]/20 transition-colors"
                  >
                    <i className="las la-pen text-sm" aria-hidden />
                    {t("edit")}
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
