import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getStaffCompanyId } from "@/lib/buildings";
import { redirect } from "next/navigation";
import { BuildingListMetaClient } from "./BuildingListMetaClient";
import { DeleteBuildingButton } from "./DeleteBuildingButton";
import type { Building, BuildingStatus } from "@/lib/supabase/types";
import { getTranslations } from "next-intl/server";
import { getPlanLimits } from "@/lib/plan.server";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80";

export default async function StaffBuildingsPage() {
  const t = await getTranslations("Buildings");
  const supabase = await createClient();
  const companyId = await getStaffCompanyId(supabase);
  if (!companyId) redirect("/dashboard/staff");

  const { data: buildings } = await supabase
    .from("buildings")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  const limits = await getPlanLimits();
  const currentCount = buildings?.length ?? 0;
  const isLimitReached = currentCount >= limits.maxBuildings;
  const tLimits = await getTranslations("Limits");

  const list = (buildings ?? []) as Building[];
  const buildingIds = list.map((b) => b.id);

  const weeklyCountByBuilding: Record<string, number> = {};
  if (buildingIds.length > 0) {
    const { data: updates } = await supabase
      .from("building_weekly_updates")
      .select("building_id")
      .in("building_id", buildingIds);
    for (const row of updates ?? []) {
      const bid = (row as { building_id: string }).building_id;
      weeklyCountByBuilding[bid] = (weeklyCountByBuilding[bid] ?? 0) + 1;
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{t("title")}</h1>
          <div 
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-sm transition-all shadow-sm ${
              isLimitReached 
                ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse" 
                : "bg-[#134e4a]/5 text-[#134e4a] border-[#134e4a]/10"
            }`}
            title={tLimits("usage")}
          >
            {currentCount} / {limits.maxBuildings === Infinity ? tLimits("unlimited") : limits.maxBuildings}
          </div>
        </div>
        <div className="flex gap-2">
          {isLimitReached ? (
            <Link
              href="/dashboard/staff/subscription"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#134e4a] text-white text-sm font-semibold hover:bg-[#115e59] transition-colors shadow-sm"
              title={tLimits("maxBuildingsReached", { count: currentCount, max: limits.maxBuildings })}
            >
              <i className="las la-arrow-up" aria-hidden />
              {tLimits("upgradeNow")}
            </Link>
          ) : (
            <Link
              href="/dashboard/staff/buildings/new"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#134e4a] text-white text-sm font-semibold hover:bg-[#115e59] transition-colors"
            >
              <i className="las la-plus" aria-hidden />
              {t("addBuilding")}
            </Link>
          )}
          <Link
            href="/dashboard/staff/weekly-photos/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            <i className="las la-camera" aria-hidden />
            {t("addWeeklyPhoto")}
          </Link>
        </div>
      </div>


      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {list.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 font-medium">{t("noBuildings")}</p>
            <p className="text-sm text-gray-400 mt-1 mb-6">{t("noBuildingsSubtitle")}</p>
            {isLimitReached ? (
              <Link
                href="/dashboard/staff/subscription"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#134e4a] text-white text-sm font-semibold hover:bg-[#115e59] transition-colors shadow-sm"
              >
                <i className="las la-arrow-up" aria-hidden />
                {tLimits("upgradeNow")}
              </Link>
            ) : (
              <Link
                href="/dashboard/staff/buildings/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#134e4a] text-white text-sm font-semibold hover:bg-[#115e59] transition-colors"
              >
                <i className="las la-plus" aria-hidden />
                {t("addBuilding")}
              </Link>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {list.map((b) => (
              <li
                key={b.id}
                className="px-6 py-4 hover:bg-gray-50/80 transition-colors flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
              >
                <Link
                  href={`/dashboard/staff/buildings/${b.id}`}
                  className="flex flex-1 min-w-0 items-center gap-4"
                >
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                    <Image
                      src={b.image_url || PLACEHOLDER_IMAGE}
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
                      {b.location || "—"} · {t("unitsCount", { count: b.units })}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-4 shrink-0 sm:pl-2 flex-wrap">
                  <BuildingListMetaClient progress={b.progress} status={b.status as BuildingStatus} />
                  <span className="text-xs text-gray-500">
                    {(weeklyCountByBuilding[b.id] ?? 0) === 0
                      ? t("noWeeklyPhotos")
                      : t("weeklyUpdateCount", { count: weeklyCountByBuilding[b.id] ?? 0 })}
                  </span>
                  <Link
                    href={`/dashboard/staff/buildings/${b.id}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#134e4a] text-white text-sm font-semibold hover:bg-[#115e59] transition-colors"
                  >
                    <i className="las la-eye text-sm" aria-hidden />
                    {t("see")}
                  </Link>
                  <Link
                    href={`/dashboard/staff/buildings/${b.id}/edit`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:border-[#134e4a] hover:text-[#134e4a] transition-colors"
                  >
                    <i className="las la-pen text-sm" aria-hidden />
                    {t("edit")}
                  </Link>
                  <DeleteBuildingButton buildingId={b.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
