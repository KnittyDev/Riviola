import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPropertyDetail } from "@/lib/propertyDetailData";
import { WeeklyPhotoUpdates } from "@/components/WeeklyPhotoUpdates";
import { BuildingProgressClient } from "@/app/dashboard/staff/buildings/[id]/BuildingOverridesClient";
import { BuildingMilestonesLog } from "@/app/dashboard/staff/buildings/[id]/BuildingMilestonesLog";
import type { PlannedMilestoneDb } from "@/lib/supabase/types";
import type { ProgressMilestoneLog } from "@/lib/staffBuildingsData";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80";

function formatPlanDate(d: string, t: string) {
  const date = new Date(d + "T" + t);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatLogDate(d: string, t: string) {
  const date = new Date(d + "T" + t);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatLogTime(t: string) {
  return t;
}

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

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let property = getPropertyDetail(id);

  if (!property) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) notFound();
    const { data: building } = await supabase
      .from("buildings")
      .select("id, name, location, image_url, progress, status, company_id, planned_milestones, current_milestone_id")
      .eq("id", id)
      .single();
    if (!building) notFound();
    const { data: assignment } = await supabase
      .from("investor_properties")
      .select("block, unit, area_m2, delivery_period, purchase_value, purchase_currency")
      .eq("building_id", id)
      .eq("profile_id", user.id)
      .maybeSingle();
    if (!assignment) notFound();

    const { data: company } = (building as { company_id?: string }).company_id
      ? await supabase
          .from("companies")
          .select("name")
          .eq("id", (building as { company_id: string }).company_id)
          .single()
      : { data: null };
    const companyName = company?.name ?? "";

    const { data: updatesRows } = await supabase
      .from("building_weekly_updates")
      .select("id, week_label, date_range, description, building_weekly_update_images(storage_path, alt, sort_order)")
      .eq("building_id", id)
      .order("created_at", { ascending: false });
    const weeklyUpdates = (updatesRows ?? []).map((u: { id: string; week_label: string | null; date_range: string; description: string; building_weekly_update_images: Array<{ storage_path: string; alt: string | null; sort_order: number }> }) => {
      const images = (u.building_weekly_update_images ?? [])
        .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
        .map((img: { storage_path: string; alt: string | null }) => {
          const { data: urlData } = supabase.storage.from("weekly_photos").getPublicUrl(img.storage_path);
          return { url: urlData.publicUrl, alt: img.alt ?? "" };
        });
      return { id: u.id, weekLabel: u.week_label ?? "", range: u.date_range, description: u.description ?? "", images };
    });

    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Link
          href="/dashboard/properties"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#134e4a] text-sm font-medium mb-6 transition-colors"
        >
          <i className="las la-arrow-left" aria-hidden />
          Back to properties
        </Link>
        <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white mb-8">
          <div className="relative h-64 md:h-80">
            <Image
              src={(building as { image_url?: string | null }).image_url || PLACEHOLDER_IMAGE}
              alt={(building as { name: string }).name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <span className="inline-block px-3 py-1 bg-white/90 text-gray-900 text-xs font-bold rounded-lg uppercase tracking-wider mb-2">
                {companyName || "Property"}
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold">
                {(building as { name: string }).name}
              </h1>
              <p className="text-white/90 text-sm mt-1 flex items-center gap-1">
                <i className="las la-map-marker-alt" aria-hidden />
                {(building as { location: string | null }).location || "—"}
              </p>
              <p className="text-white/90 text-sm mt-2 font-medium">
                Your unit: {assignment.block} · {assignment.unit}
              </p>
            </div>
          </div>
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-gray-100">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Progress</p>
              <div className="mt-1">
                <BuildingProgressClient progress={(building as { progress: number }).progress} />
              </div>
            </div>
            {(assignment as { area_m2?: number | null })?.area_m2 != null && (assignment as { area_m2: number }).area_m2 > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Area</p>
                <p className="text-gray-900 font-bold mt-1">{(assignment as { area_m2: number }).area_m2} m²</p>
              </div>
            )}
            {(assignment as { delivery_period?: string | null })?.delivery_period?.trim() && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Delivery</p>
                <p className="text-gray-900 font-bold mt-1">{(assignment as { delivery_period: string }).delivery_period}</p>
              </div>
            )}
          </div>
          {(() => {
            const planned = (building as { planned_milestones?: PlannedMilestoneDb[] }).planned_milestones ?? [];
            const currentId = (building as { current_milestone_id?: string | null }).current_milestone_id ?? null;
            const { current, next } = getCurrentAndNextLabels(planned, currentId);
            return (
              <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Current milestone</p>
                  <p className="text-gray-700 mt-0.5">{current ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Next milestone</p>
                  <p className="text-gray-700 mt-0.5">{next ?? "—"}</p>
                </div>
              </div>
            );
          })()}
        </div>
        <BuildingMilestonesLog
          milestones={plannedMilestonesToLog((building as { planned_milestones?: PlannedMilestoneDb[] }).planned_milestones ?? [])}
          currentMilestoneId={(building as { current_milestone_id?: string | null }).current_milestone_id ?? null}
        />
        {weeklyUpdates.length > 0 && (
          <div className="mt-8">
            <WeeklyPhotoUpdates weeklyUpdates={weeklyUpdates} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Back link */}
      <Link
        href="/dashboard/properties"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-[#134e4a] text-sm font-medium mb-6 transition-colors"
      >
        <i className="las la-arrow-left" aria-hidden />
        Back to properties
      </Link>

      {/* Hero */}
      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white mb-8">
        <div className="relative h-64 md:h-80">
          <Image
            src={property.imageSrc}
            alt={property.imageAlt}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <span className="inline-block px-3 py-1 bg-white/90 text-gray-900 text-xs font-bold rounded-lg uppercase tracking-wider mb-2">
              {property.badge}
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold">
              {property.title}
            </h1>
            <p className="text-white/90 text-sm mt-1 flex items-center gap-1">
              <i className="las la-map-marker-alt" aria-hidden />
              {property.location}
            </p>
          </div>
        </div>
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-gray-100">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Progress</p>
            <p className="text-xl font-bold text-[#134e4a]">{property.progress}%</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Value</p>
            <p className="text-xl font-bold text-gray-900">{property.value}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Area</p>
            <p className="text-xl font-bold text-gray-900">{property.area}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Delivery</p>
            <p className="text-xl font-bold text-gray-900">{property.deliveryDate}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Plans */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <i className="las la-calendar-check text-[#134e4a] text-xl" aria-hidden />
            <h2 className="text-lg font-bold text-gray-900">Plans & schedule</h2>
          </div>
          <div className="p-6">
            <div className="relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gray-200" />
              <ul className="space-y-0">
                {property.plans.map((plan, i) => (
                  <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
                    <div
                      className={`relative z-10 shrink-0 mt-0.5 size-6 rounded-full flex items-center justify-center ${
                        plan.status === "completed"
                          ? "bg-emerald-500"
                          : plan.status === "in-progress"
                            ? "bg-amber-500 ring-4 ring-amber-500/20"
                            : "bg-gray-200"
                      }`}
                    >
                      {plan.status === "completed" && (
                        <i className="las la-check text-white text-xs" aria-hidden />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-gray-500">
                        {formatPlanDate(plan.date, plan.time)}
                      </p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">
                        {plan.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                      {plan.status === "in-progress" && (
                        <span className="inline-block mt-2 px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold uppercase">
                          In progress
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Logs */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <i className="las la-clipboard-list text-[#134e4a] text-xl" aria-hidden />
            <h2 className="text-lg font-bold text-gray-900">Activity log</h2>
          </div>
          <div className="p-6 max-h-[600px] overflow-y-auto">
            <ul className="space-y-4">
              {property.logs.map((log, i) => (
                <li
                  key={i}
                  className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                >
                  <div className="shrink-0 w-16 text-right">
                    <p className="text-[10px] font-mono text-gray-500 uppercase">
                      {formatLogDate(log.date, log.time)}
                    </p>
                    <p className="text-xs font-mono font-semibold text-gray-700 mt-0.5">
                      {formatLogTime(log.time)}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-bold uppercase mb-1">
                      {log.category}
                    </span>
                    <p className="text-sm text-gray-800">{log.message}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* Weekly photo updates */}
      {property.weeklyUpdates && property.weeklyUpdates.length > 0 && (
        <WeeklyPhotoUpdates weeklyUpdates={property.weeklyUpdates} />
      )}
    </div>
  );
}
