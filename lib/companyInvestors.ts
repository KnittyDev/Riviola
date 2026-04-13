import type { SupabaseClient } from "@supabase/supabase-js";

export type CompanyInvestor = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  property_count: number;
};

/** Single row for staff: one investor property with project (building), block, unit, etc. */
export type CompanyInvestorPropertyRow = {
  id: string;
  profile_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  investor_type: "renter" | "buyer" | null;
  created_at: string;
  building_id: string;
  building_name: string;
  block: string;
  unit: string;
  area_m2: number | null;
  delivery_period: string | null;
  purchase_value: number | null;
  purchase_currency: string | null;
  language: string | null;
  currency: string | null;
};

/**
 * Fetches all investor_properties for the company's buildings, with building name and investor name.
 * Pass a client that can read profiles (e.g. service role) to get full_name/email.
 */
export async function getCompanyInvestorProperties(
  supabase: SupabaseClient,
  companyId: string
): Promise<CompanyInvestorPropertyRow[]> {
  const { data: buildings, error: buildingsError } = await supabase
    .from("buildings")
    .select("id, name")
    .eq("company_id", companyId);

  if (buildingsError || !buildings?.length) return [];

  const buildingIds = buildings.map((b) => b.id);
  const buildingNames = new Map(buildings.map((b) => [b.id, b.name]));

  const { data: rows, error: rowsError } = await supabase
    .from("investor_properties")
    .select("id, profile_id, building_id, block, unit, area_m2, delivery_period, purchase_value, purchase_currency, created_at")
    .in("building_id", buildingIds)
    .order("block")
    .order("unit");

  if (rowsError) {
    console.error("[companyInvestors] investor_properties error:", rowsError.message);
    return [];
  }

  const profileIds = [...new Set((rows ?? []).map((r: { profile_id: string }) => r.profile_id))];
  const profileMap = new Map<string, { full_name: string | null; email: string | null; phone: string | null; investor_type: "renter" | "buyer" | null; language: string | null; currency: string | null }>();
  if (profileIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, investor_type, language, currency")
      .in("id", profileIds);
    (profiles ?? []).forEach((p: { id: string; full_name: string | null; email: string | null; phone: string | null; investor_type: "renter" | "buyer" | null; language: string | null; currency: string | null }) => {
      profileMap.set(p.id, {
        full_name: p.full_name?.trim() ?? null,
        email: p.email?.trim() ?? null,
        phone: p.phone?.trim() ?? null,
        investor_type: p.investor_type ?? null,
        language: p.language ?? null,
        currency: p.currency ?? null,
      });
    });
  }

  return (rows ?? []).map((r: {
    id: string;
    profile_id: string;
    created_at: string;
    building_id: string;
    block: string;
    unit: string;
    area_m2: number | null;
    delivery_period: string | null;
    purchase_value: number | null;
    purchase_currency: string | null;
  }) => {
    const profile = profileMap.get(r.profile_id);
    return {
      id: r.id,
      profile_id: r.profile_id,
      full_name: profile?.full_name ?? null,
      email: profile?.email ?? null,
      phone: profile?.phone ?? null,
      investor_type: profile?.investor_type ?? null,
      created_at: r.created_at,
      building_id: r.building_id,
      building_name: buildingNames.get(r.building_id) ?? "",
      block: r.block,
      unit: r.unit,
      area_m2: r.area_m2 != null ? Number(r.area_m2) : null,
      delivery_period: r.delivery_period ?? null,
      purchase_value: r.purchase_value != null ? Number(r.purchase_value) : null,
      purchase_currency: r.purchase_currency ?? null,
      language: profile?.language ?? null,
      currency: profile?.currency ?? null,
    };
  });
}

/**
 * Fetches investors who have at least one property (unit) in a building
 * belonging to the given company. Used on staff Investors page.
 */
export async function getCompanyInvestors(
  supabase: SupabaseClient,
  companyId: string
): Promise<CompanyInvestor[]> {
  const { data: buildingIds } = await supabase
    .from("buildings")
    .select("id")
    .eq("company_id", companyId);

  if (!buildingIds?.length) return [];

  const ids = buildingIds.map((b) => b.id);

  const { data: props, error: propsError } = await supabase
    .from("investor_properties")
    .select("profile_id")
    .in("building_id", ids);

  if (propsError) {
    console.error("[companyInvestors] investor_properties error:", propsError.message);
    return [];
  }

  const profileIds = [...new Set((props ?? []).map((p: { profile_id: string }) => p.profile_id))];
  if (!profileIds.length) return [];

  const countByProfile = new Map<string, number>();
  (props ?? []).forEach((p: { profile_id: string }) => {
    countByProfile.set(p.profile_id, (countByProfile.get(p.profile_id) ?? 0) + 1);
  });

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, role")
    .in("id", profileIds);

  if (profilesError) {
    console.error("[companyInvestors] profiles error:", profilesError.message);
    return [];
  }

  return (profiles ?? [])
    .filter((p: { role: string }) => p.role === "investor")
    .map((p: { id: string; full_name: string | null; email: string | null; phone: string | null }) => ({
      id: p.id,
      full_name: p.full_name?.trim() ?? null,
      email: p.email?.trim() ?? null,
      phone: p.phone?.trim() ?? null,
      property_count: countByProfile.get(p.id) ?? 0,
    }))
    .sort((a, b) => (a.full_name ?? "").localeCompare(b.full_name ?? ""));
}
