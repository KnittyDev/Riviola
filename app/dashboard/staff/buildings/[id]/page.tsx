import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getStaffCompanyId } from "@/lib/buildings";
import { notFound } from "next/navigation";
import { BuildingMilestonesLog } from "./BuildingMilestonesLog";
import { BuildingProgressClient, BuildingStatusBadgeClient } from "./BuildingOverridesClient";
import { DeleteBuildingButton } from "../DeleteBuildingButton";
import { WeeklyPhotoUpdates } from "@/components/WeeklyPhotoUpdates";
import { WeatherWidget } from "@/components/dashboard/properties/WeatherWidget";
import type { Building, BuildingStatus } from "@/lib/supabase/types";
import type { PlannedMilestoneDb } from "@/lib/supabase/types";
import type { ProgressMilestoneLog } from "@/lib/staffBuildingsData";
import type { WeeklyPhotoUpdate } from "@/lib/propertyDetailData";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80";

function plannedMilestonesToLog(items: PlannedMilestoneDb[]): ProgressMilestoneLog[] {
  if (!Array.isArray(items) || items.length === 0) return [];
  return items
    .map((m) => {
      const label = (m.title && m.title.trim()) || "Milestone";
      const dateTime = m.dateTimeLocal ? (m.dateTimeLocal.includes("T") ? m.dateTimeLocal : `${m.dateTimeLocal}T00:00:00`) : undefined;
      const date = dateTime
        ? new Date(dateTime).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
        : "";
      return { id: m.id, label, date, dateTime };
    })
    .sort((a, b) => {
      if (!a.dateTime || !b.dateTime) return 0;
      return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
    });
}

/** Current = label for current_milestone_id. Next = label for the milestone after current in date order. */
function getCurrentAndNextLabels(
  planned: PlannedMilestoneDb[],
  currentMilestoneId: string | null
): { current: string | null; next: string | null } {
  if (!Array.isArray(planned) || planned.length === 0) return { current: null, next: null };
  const sorted = [...planned].sort((a, b) => {
    const da = a.dateTimeLocal ? new Date(a.dateTimeLocal).getTime() : 0;
    const db = b.dateTimeLocal ? new Date(b.dateTimeLocal).getTime() : 0;
    return da - db;
  });
  const idx = currentMilestoneId ? sorted.findIndex((m) => m.id === currentMilestoneId) : -1;
  const current = idx >= 0 ? ((sorted[idx].title && sorted[idx].title.trim()) || "Milestone") : null;
  const nextItem = idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : null;
  const next = nextItem ? ((nextItem.title && nextItem.title.trim()) || "Milestone") : null;
  return { current, next };
}

export default async function StaffBuildingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const companyId = await getStaffCompanyId(supabase);
  if (!companyId) notFound();

  const { data: row } = await supabase
    .from("buildings")
    .select("*")
    .eq("id", id)
    .eq("company_id", companyId)
    .single();

  if (!row) notFound();
  const building = row as Building;

  const { data: updatesRows } = await supabase
    .from("building_weekly_updates")
    .select("id, week_label, date_range, description, building_weekly_update_images(storage_path, alt, sort_order)")
    .eq("building_id", id)
    .order("created_at", { ascending: false });

  const weeklyUpdates: WeeklyPhotoUpdate[] = [];
  if (updatesRows?.length) {
    for (const u of updatesRows as Array<{
      id: string;
      week_label: string | null;
      date_range: string;
      description: string;
      building_weekly_update_images: Array<{ storage_path: string; alt: string | null; sort_order: number }>;
    }>) {
      const images = (u.building_weekly_update_images ?? [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((img) => {
          const { data: urlData } = supabase.storage.from("weekly_photos").getPublicUrl(img.storage_path);
          return { url: urlData.publicUrl, alt: img.alt ?? "" };
        });
      weeklyUpdates.push({
        id: u.id,
        weekLabel: u.week_label ?? "",
        range: u.date_range,
        description: u.description ?? "",
        images,
      });
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link
        href="/dashboard/staff/buildings"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#134e4a] mb-6"
      >
        <i className="las la-arrow-left" aria-hidden />
        Back to buildings
      </Link>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="relative w-full h-32 sm:h-36 bg-gray-100">
          <Image
            src={building.image_url || PLACEHOLDER_IMAGE}
            alt={building.name}
            fill
            className="object-cover object-center"
            sizes="100vw"
            quality={90}
            priority
          />
        </div>
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">{building.name}</h1>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Link
              href={`/dashboard/staff/weekly-photos/new?buildingId=${id}`}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-[#134e4a] text-white text-xs sm:text-sm font-semibold hover:bg-[#115e59] transition-colors"
            >
              <i className="las la-camera text-sm sm:text-base" aria-hidden />
              Add weekly photo
            </Link>
            <Link
              href={`/dashboard/staff/buildings/${id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl border border-gray-200 text-gray-700 text-xs sm:text-sm font-semibold hover:bg-gray-50 hover:border-[#134e4a] hover:text-[#134e4a] transition-colors"
            >
              <i className="las la-pen text-sm" aria-hidden />
              Edit
            </Link>
            <DeleteBuildingButton buildingId={id} />
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</p>
            <p className="text-gray-900 font-medium flex items-center gap-1 mt-0.5">
              <i className="las la-map-marker-alt text-gray-400" aria-hidden />
              {building.location || "—"}
            </p>
            <WeatherWidget city={building.city ?? undefined} country={building.country ?? undefined} mode="light" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Units</p>
            <p className="text-gray-900 font-medium">{building.units}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Progress</p>
            <div className="flex items-center gap-3">
              <BuildingProgressClient progress={building.progress} />
              <BuildingStatusBadgeClient status={building.status as BuildingStatus} />
            </div>
          </div>
          {(() => {
            const { current, next } = getCurrentAndNextLabels(building.planned_milestones ?? [], building.current_milestone_id);
            return (
              <>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Current milestone</p>
                  <p className="text-gray-700 mt-0.5">{current ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Next milestone</p>
                  <p className="text-gray-700 mt-0.5">{next ?? "—"}</p>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      <BuildingMilestonesLog
        milestones={plannedMilestonesToLog(building.planned_milestones ?? [])}
        currentMilestoneId={building.current_milestone_id ?? null}
      />

      {
        weeklyUpdates.length > 0 && (
          <div className="mt-8">
            <WeeklyPhotoUpdates weeklyUpdates={weeklyUpdates} />
          </div>
        )
      }
    </div >
  );
}
