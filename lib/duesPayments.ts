import type { SupabaseClient } from "@supabase/supabase-js";

export type AreaPricingTier = {
  min: number;
  max: number;
  amount_cents: number;
};

export type BuildingDuesSettingsInput = {
  payment_window_start_day: number;
  payment_window_end_day: number;
  amount_cents?: number | null;
  currency?: string | null;
  area_pricing?: AreaPricingTier[] | null;
};

export type UnitForDues = {
  id: string;
  block: string;
  unit: string;
  profile_id: string;
  full_name?: string | null;
  area_m2?: number | null;
};

export type DuesPaymentStatus = {
  paid_at: string | null;
  marked_by: string | null;
};

/**
 * Returns dues settings for a building, or null if not set.
 */
export async function getBuildingDuesSettings(
  supabase: SupabaseClient,
  buildingId: string
): Promise<{
  payment_window_start_day: number;
  payment_window_end_day: number;
  amount_cents: number | null;
  currency: string | null;
  area_pricing: AreaPricingTier[] | null;
  updated_at: string;
} | null> {
  const { data, error } = await supabase
    .from("building_dues_settings")
    .select("payment_window_start_day, payment_window_end_day, amount_cents, currency, area_pricing, updated_at")
    .eq("building_id", buildingId)
    .single();

  if (error || !data) return null;
  return {
    payment_window_start_day: data.payment_window_start_day,
    payment_window_end_day: data.payment_window_end_day,
    amount_cents: data.amount_cents ?? null,
    currency: data.currency ?? null,
    area_pricing: data.area_pricing ?? null,
    updated_at: data.updated_at,
  };
}

/**
 * Upserts building dues settings. RLS: staff's company buildings only.
 */
export async function setBuildingDuesSettings(
  supabase: SupabaseClient,
  buildingId: string,
  input: BuildingDuesSettingsInput
): Promise<boolean> {
  const { error } = await supabase
    .from("building_dues_settings")
    .upsert(
      {
        building_id: buildingId,
        payment_window_start_day: input.payment_window_start_day,
        payment_window_end_day: input.payment_window_end_day,
        amount_cents: input.amount_cents ?? null,
        currency: input.currency ?? null,
        area_pricing: input.area_pricing ?? [],
        updated_at: new Date().toISOString(),
      },
      { onConflict: "building_id" }
    );

  if (error) {
    console.error("[duesPayments] setBuildingDuesSettings error:", error.message);
    return false;
  }
  return true;
}

/**
 * Returns all units (investor_properties) for a building. Optionally with full_name if supabase can read profiles.
 */
export async function getUnitsForBuilding(
  supabase: SupabaseClient,
  buildingId: string
): Promise<UnitForDues[]> {
  const { data: rows, error } = await supabase
    .from("investor_properties")
    .select("id, block, unit, profile_id, area_m2")
    .eq("building_id", buildingId)
    .order("block")
    .order("unit");

  if (error) {
    console.error("[duesPayments] getUnitsForBuilding error:", error.message);
    return [];
  }

  const profileIds = [...new Set((rows ?? []).map((r: { profile_id: string }) => r.profile_id))];
  const nameMap = new Map<string, string | null>();
  if (profileIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", profileIds);
    (profiles ?? []).forEach((p: { id: string; full_name: string | null }) => {
      nameMap.set(p.id, p.full_name?.trim() ?? null);
    });
  }

  return (rows ?? []).map((r: { id: string; block: string; unit: string; profile_id: string; area_m2: number | null }) => ({
    id: r.id,
    block: r.block,
    unit: r.unit,
    profile_id: r.profile_id,
    full_name: nameMap.get(r.profile_id) ?? undefined,
    area_m2: r.area_m2,
  }));
}

/**
 * Returns period keys (YYYY-MM) from the earliest investor_property created_at month in this building
 * through current month + 2. Used for staff dues table columns so dues start from when units were registered.
 */
export async function getPeriodsForBuildingFromEarliestUnit(
  supabase: SupabaseClient,
  buildingId: string
): Promise<string[]> {
  const { data: rows, error } = await supabase
    .from("investor_properties")
    .select("created_at")
    .eq("building_id", buildingId)
    .limit(1000);

  if (error || !rows?.length) {
    const now = new Date();
    const periods: string[] = [];
    for (let i = -12; i <= 2; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      periods.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }
    return periods;
  }

  let earliest = new Date((rows[0] as { created_at: string }).created_at);
  rows.forEach((r) => {
    const d = new Date((r as { created_at: string }).created_at);
    if (d < earliest) earliest = d;
  });

  const startYear = earliest.getFullYear();
  const startMonth = earliest.getMonth() + 1;
  const now = new Date();
  const endDate = new Date(now.getFullYear(), now.getMonth() + 3, 0);
  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth() + 1;

  const periods: string[] = [];
  let y = startYear;
  let m = startMonth;
  while (y < endYear || (y === endYear && m <= endMonth)) {
    periods.push(`${y}-${String(m).padStart(2, "0")}`);
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return periods;
}

/**
 * Returns which units (investor_property_id) have a dues_payments record for the given building and period.
 * Map<investor_property_id, { paid_at, marked_by }>.
 */
export async function getDuesPaymentsForBuildingAndPeriod(
  supabase: SupabaseClient,
  buildingId: string,
  period: string
): Promise<Map<string, DuesPaymentStatus>> {
  const { data: unitIds } = await supabase
    .from("investor_properties")
    .select("id")
    .eq("building_id", buildingId);

  if (!unitIds?.length) return new Map();

  const ids = unitIds.map((u: { id: string }) => u.id);
  const { data: payments, error } = await supabase
    .from("dues_payments")
    .select("investor_property_id, paid_at, marked_by")
    .in("investor_property_id", ids)
    .eq("period", period);

  if (error) {
    console.error("[duesPayments] getDuesPaymentsForBuildingAndPeriod error:", error.message);
    return new Map();
  }

  const map = new Map<string, DuesPaymentStatus>();
  (payments ?? []).forEach((p: { investor_property_id: string; paid_at: string | null; marked_by: string | null }) => {
    map.set(p.investor_property_id, { paid_at: p.paid_at, marked_by: p.marked_by });
  });
  return map;
}

/**
 * Returns paid status per period per unit for a building. periods = e.g. ["2025-01", "2025-02", ...].
 * Result: Record<period, Record<investor_property_id, DuesPaymentStatus>> (serializable for client).
 */
export async function getDuesPaymentsForBuildingAndPeriods(
  supabase: SupabaseClient,
  buildingId: string,
  periods: string[]
): Promise<Record<string, Record<string, DuesPaymentStatus>>> {
  if (!periods.length) return {};
  const { data: unitIds } = await supabase
    .from("investor_properties")
    .select("id")
    .eq("building_id", buildingId);
  if (!unitIds?.length) return {};
  const ids = unitIds.map((u: { id: string }) => u.id);
  const { data: payments, error } = await supabase
    .from("dues_payments")
    .select("investor_property_id, period, paid_at, marked_by")
    .in("investor_property_id", ids)
    .in("period", periods);
  if (error) {
    console.error("[duesPayments] getDuesPaymentsForBuildingAndPeriods error:", error.message);
    return {};
  }
  const byPeriod: Record<string, Record<string, DuesPaymentStatus>> = {};
  periods.forEach((p) => {
    byPeriod[p] = {};
  });
  (payments ?? []).forEach(
    (row: {
      investor_property_id: string;
      period: string;
      paid_at: string | null;
      marked_by: string | null;
    }) => {
      if (!byPeriod[row.period]) byPeriod[row.period] = {};
      byPeriod[row.period][row.investor_property_id] = {
        paid_at: row.paid_at,
        marked_by: row.marked_by,
      };
    }
  );
  return byPeriod;
}

/**
 * Marks a unit as paid for the period. Upserts dues_payments with paid_at = now(), marked_by = staffProfileId.
 */
export async function markDuesPaid(
  supabase: SupabaseClient,
  investorPropertyId: string,
  period: string,
  staffProfileId: string
): Promise<boolean> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("dues_payments")
    .upsert(
      {
        investor_property_id: investorPropertyId,
        period,
        paid_at: now,
        marked_by: staffProfileId,
      },
      { onConflict: "investor_property_id,period" }
    );

  if (error) {
    console.error("[duesPayments] markDuesPaid error:", error.message);
    return false;
  }
  return true;
}

/**
 * Removes the paid mark for a unit in a period (deletes the dues_payments row).
 */
export async function unmarkDuesPaid(
  supabase: SupabaseClient,
  investorPropertyId: string,
  period: string
): Promise<boolean> {
  const { error } = await supabase
    .from("dues_payments")
    .delete()
    .eq("investor_property_id", investorPropertyId)
    .eq("period", period);

  if (error) {
    console.error("[duesPayments] unmarkDuesPaid error:", error.message);
    return false;
  }
  return true;
}

export type StaffRecentPaymentItem = {
  id: string;
  buildingName: string;
  unit: string;
  investorName: string | null;
  period: string;
  paid_at: string;
};

/**
 * Returns the most recent dues payments for the staff's company (for dashboard alerts).
 */
export async function getStaffRecentDuesPayments(
  supabase: SupabaseClient,
  companyId: string,
  limit = 10
): Promise<StaffRecentPaymentItem[]> {
  const { data: buildings } = await supabase
    .from("buildings")
    .select("id, name")
    .eq("company_id", companyId);
  if (!buildings?.length) return [];
  const buildingIds = buildings.map((b) => b.id);
  const buildingMap = new Map(buildings.map((b) => [b.id, b.name ?? ""]));

  const { data: props } = await supabase
    .from("investor_properties")
    .select("id, building_id, block, unit, profile_id")
    .in("building_id", buildingIds);
  if (!props?.length) return [];
  const propIds = props.map((p) => p.id);
  const propMap = new Map(
    (props as { id: string; building_id: string; block: string; unit: string; profile_id: string }[]).map(
      (p) => [p.id, p]
    )
  );

  const { data: payments, error } = await supabase
    .from("dues_payments")
    .select("investor_property_id, period, paid_at")
    .in("investor_property_id", propIds)
    .not("paid_at", "is", null)
    .order("paid_at", { ascending: false })
    .limit(limit);

  if (error || !payments?.length) return [];

  const profileIds = [...new Set(props.map((p: { profile_id: string }) => p.profile_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", profileIds);
  const profileMap = new Map(
    (profiles ?? []).map((p: { id: string; full_name: string | null }) => [p.id, p.full_name ?? null])
  );

  return (payments as { investor_property_id: string; period: string; paid_at: string }[]).map(
    (p, i) => {
      const prop = propMap.get(p.investor_property_id);
      const buildingName = prop ? buildingMap.get(prop.building_id) ?? "" : "";
      const unit = prop ? `Block ${prop.block}, Unit ${prop.unit}` : "";
      const investorName = prop ? profileMap.get(prop.profile_id) ?? null : null;
      const periodLabel = (() => {
        const [y, m] = p.period.split("-").map(Number);
        return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
      })();
      return {
        id: `${p.investor_property_id}:${p.period}:${i}`,
        buildingName,
        unit,
        investorName,
        period: periodLabel,
        paid_at: p.paid_at,
      };
    }
  );
}

export type StaffOverdueDueItem = {
  id: string;
  buildingName: string;
  unit: string;
  investorName: string | null;
  period: string;
  dueDate: string;
};

/**
 * Returns overdue dues (unpaid periods whose due date has passed) for the staff's company.
 */
export async function getStaffOverdueDues(
  supabase: SupabaseClient,
  companyId: string,
  limit = 20
): Promise<StaffOverdueDueItem[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: buildings } = await supabase
    .from("buildings")
    .select("id, name")
    .eq("company_id", companyId);
  if (!buildings?.length) return [];
  const buildingIds = buildings.map((b) => b.id);
  const buildingMap = new Map(buildings.map((b) => [b.id, b.name ?? ""]));

  const { data: settingsRows } = await supabase
    .from("building_dues_settings")
    .select("building_id, payment_window_end_day")
    .in("building_id", buildingIds);
  const endDayByBuilding = new Map(
    (settingsRows ?? []).map((s: { building_id: string; payment_window_end_day: number }) => [
      s.building_id,
      s.payment_window_end_day ?? 31,
    ])
  );

  const { data: props } = await supabase
    .from("investor_properties")
    .select("id, building_id, block, unit, profile_id, created_at")
    .in("building_id", buildingIds);
  if (!props?.length) return [];

  const propIds = props.map((p: { id: string }) => p.id);
  const { data: paidRows } = await supabase
    .from("dues_payments")
    .select("investor_property_id, period")
    .in("investor_property_id", propIds);
  const paidSet = new Set(
    (paidRows ?? []).map(
      (r: { investor_property_id: string; period: string }) => `${r.investor_property_id}:${r.period}`
    )
  );

  const profileIds = [...new Set((props as { profile_id: string }[]).map((p) => p.profile_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", profileIds);
  const profileMap = new Map(
    (profiles ?? []).map((p: { id: string; full_name: string | null }) => [p.id, p.full_name ?? null])
  );

  const overdue: StaffOverdueDueItem[] = [];
  const periodRange = (startYYYYMM: string, endYYYYMM: string): string[] => {
    const [sy, sm] = startYYYYMM.split("-").map(Number);
    const [ey, em] = endYYYYMM.split("-").map(Number);
    const out: string[] = [];
    let y = sy,
      m = sm;
    while (y < ey || (y === ey && m <= em)) {
      out.push(`${y}-${String(m).padStart(2, "0")}`);
      m++;
      if (m > 12) {
        m = 1;
        y++;
      }
    }
    return out;
  };
  const endPeriod = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  for (const prop of props as {
    id: string;
    building_id: string;
    block: string;
    unit: string;
    profile_id: string;
    created_at: string;
  }[]) {
    const created = prop.created_at ? new Date(prop.created_at) : new Date();
    const startPeriod = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, "0")}`;
    const periods = periodRange(startPeriod, endPeriod);
    const endDay = endDayByBuilding.get(prop.building_id) ?? 31;

    for (const period of periods) {
      const key = `${prop.id}:${period}`;
      if (paidSet.has(key)) continue;
      const [y, m] = period.split("-").map(Number);
      const dueDate = new Date(y, m - 1, Math.min(endDay, 28));
      dueDate.setHours(0, 0, 0, 0);
      if (dueDate >= today) continue;

      const periodLabel = new Date(y, m - 1, 1).toLocaleDateString("en-GB", {
        month: "short",
        year: "numeric",
      });
      const dueDateStr = dueDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      overdue.push({
        id: key,
        buildingName: buildingMap.get(prop.building_id) ?? "",
        unit: `Block ${prop.block}, Unit ${prop.unit}`,
        investorName: profileMap.get(prop.profile_id) ?? null,
        period: periodLabel,
        dueDate: dueDateStr,
      });
      if (overdue.length >= limit) break;
    }
    if (overdue.length >= limit) break;
  }

  return overdue;
}
