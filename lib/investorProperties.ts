import type { SupabaseClient } from "@supabase/supabase-js";

/** Single upcoming milestone for dashboard display. */
export type InvestorUpcomingMilestoneItem = {
  date: string;
  dateIso: string;
  title: string;
  active: boolean;
  building_name: string;
};

/** Single weekly update with building context for dashboard display. */
export type InvestorWeeklyUpdateItem = {
  id: string;
  building_id: string;
  building_name: string;
  week_label: string;
  date_range: string;
  description: string;
  images: { url: string; alt: string }[];
};

export type InvestorPropertyWithBuilding = {
  id: string;
  building_id: string;
  block: string;
  unit: string;
  area_m2: number | null;
  delivery_period: string | null;
  building: {
    name: string;
    location: string | null;
    image_url: string | null;
    progress: number;
    status: string;
  };
  company_name: string;
};

/**
 * Fetches all properties assigned to the given investor.
 *
 * Pass a client created with `createClientWithToken(accessToken)` so that
 * the Bearer JWT is sent explicitly — guaranteeing RLS sees auth.uid().
 */
export async function getInvestorPropertiesWithBuilding(
  supabase: SupabaseClient,
  profileId: string
): Promise<InvestorPropertyWithBuilding[]> {
  // Step 1: fetch the investor's own property rows
  const { data: rows, error: rowsError } = await supabase
    .from("investor_properties")
    .select("id, building_id, block, unit, area_m2, delivery_period")
    .eq("profile_id", profileId);

  if (rowsError) {
    console.error("[investorProperties] fetch rows error:", rowsError.message);
    return [];
  }
  if (!rows?.length) return [];

  const buildingIds = [...new Set(rows.map((r) => r.building_id))];

  // Step 2: fetch the buildings (RLS allows if investor has a row in investor_properties)
  const { data: buildings, error: buildingsError } = await supabase
    .from("buildings")
    .select("id, name, location, image_url, progress, status, company_id")
    .in("id", buildingIds);

  if (buildingsError) {
    console.error("[investorProperties] fetch buildings error:", buildingsError.message);
    return [];
  }
  if (!buildings?.length) return [];

  // Step 3: fetch company names
  const companyIds = [
    ...new Set(buildings.map((b) => b.company_id).filter(Boolean)),
  ];
  const { data: companies } = await supabase
    .from("companies")
    .select("id, name")
    .in("id", companyIds);

  const companyMap = new Map((companies ?? []).map((c) => [c.id, c.name ?? ""]));
  const buildingMap = new Map(
    buildings.map((b) => [
      b.id,
      {
        name: b.name ?? "",
        location: b.location ?? null,
        image_url: b.image_url ?? null,
        progress: b.progress ?? 0,
        status: (b.status as string) ?? "In progress",
        company_id: b.company_id as string | null,
      },
    ])
  );

  return rows.map((r) => {
    const bld = buildingMap.get(r.building_id);
    return {
      id: r.id,
      building_id: r.building_id,
      block: r.block,
      unit: r.unit,
      area_m2: r.area_m2 ?? null,
      delivery_period: r.delivery_period ?? null,
      building: bld
        ? {
            name: bld.name,
            location: bld.location,
            image_url: bld.image_url,
            progress: bld.progress,
            status: bld.status,
          }
        : { name: "", location: null, image_url: null, progress: 0, status: "In progress" },
      company_name: bld?.company_id ? (companyMap.get(bld.company_id) ?? "") : "",
    };
  });
}

/**
 * Fetches weekly photo updates for the given building IDs (investor's properties).
 * Use the same token client as for getInvestorPropertiesWithBuilding so RLS allows access.
 */
export async function getInvestorWeeklyUpdates(
  supabase: SupabaseClient,
  buildingIds: string[],
  buildingNameById: Map<string, string>
): Promise<InvestorWeeklyUpdateItem[]> {
  if (buildingIds.length === 0) return [];

  const { data: updatesRows, error } = await supabase
    .from("building_weekly_updates")
    .select("id, building_id, week_label, date_range, description, building_weekly_update_images(storage_path, alt, sort_order)")
    .in("building_id", buildingIds)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[investorProperties] weekly updates error:", error.message);
    return [];
  }
  if (!updatesRows?.length) return [];

  const result: InvestorWeeklyUpdateItem[] = [];

  for (const row of updatesRows as Array<{
    id: string;
    building_id: string;
    week_label: string | null;
    date_range: string;
    description: string;
    building_weekly_update_images: Array<{ storage_path: string; alt: string | null; sort_order: number }>;
  }>) {
    const images = (row.building_weekly_update_images ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => {
        const { data: urlData } = supabase.storage.from("weekly_photos").getPublicUrl(img.storage_path);
        return { url: urlData.publicUrl, alt: img.alt ?? "" };
      });

    result.push({
      id: row.id,
      building_id: row.building_id,
      building_name: buildingNameById.get(row.building_id) ?? "Property",
      week_label: row.week_label ?? "",
      date_range: row.date_range,
      description: row.description ?? "",
      images,
    });
  }

  return result;
}

type PlannedMilestoneRow = { id: string; title: string; dateTimeLocal: string };

/**
 * Fetches upcoming milestones for the investor's buildings (current + next per building),
 * sorted by date, for dashboard display.
 */
export async function getInvestorUpcomingMilestones(
  supabase: SupabaseClient,
  buildingIds: string[],
  buildingNameById: Map<string, string>,
  limit = 5
): Promise<InvestorUpcomingMilestoneItem[]> {
  if (buildingIds.length === 0) return [];

  const { data: buildings, error } = await supabase
    .from("buildings")
    .select("id, name, planned_milestones, current_milestone_id")
    .in("id", buildingIds);

  if (error || !buildings?.length) return [];

  const all: InvestorUpcomingMilestoneItem[] = [];

  for (const b of buildings as Array<{
    id: string;
    name: string;
    planned_milestones: PlannedMilestoneRow[] | null;
    current_milestone_id: string | null;
  }>) {
    const planned = Array.isArray(b.planned_milestones) ? b.planned_milestones : [];
    if (planned.length === 0) continue;

    const sorted = [...planned].sort(
      (a, b) =>
        new Date(a.dateTimeLocal || 0).getTime() - new Date(b.dateTimeLocal || 0).getTime()
    );
    const currentIdx = b.current_milestone_id
      ? sorted.findIndex((m) => m.id === b.current_milestone_id)
      : -1;
    const startIdx = currentIdx >= 0 ? currentIdx : 0;
    const buildingName = buildingNameById.get(b.id) ?? b.name ?? "Property";

    for (let i = startIdx; i < Math.min(startIdx + 3, sorted.length); i++) {
      const m = sorted[i];
      const dt = m.dateTimeLocal ? new Date(m.dateTimeLocal) : null;
      const dateStr = dt
        ? dt.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }).toUpperCase()
        : "";
      const dateIso = dt ? dt.toISOString() : "";
      all.push({
        date: dateStr,
        dateIso,
        title: (m.title && m.title.trim()) || "Milestone",
        active: i === currentIdx,
        building_name: buildingName,
      });
    }
  }

  return all
    .sort((a, b) => (a.dateIso || "").localeCompare(b.dateIso || ""))
    .slice(0, limit);
}
