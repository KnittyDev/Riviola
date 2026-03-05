import type { SupabaseClient } from "@supabase/supabase-js";

export type InvestorPropertyWithBuilding = {
  id: string;
  building_id: string;
  block: string;
  unit: string;
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
    .select("id, building_id, block, unit")
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
