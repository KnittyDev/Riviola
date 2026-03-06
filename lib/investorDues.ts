import type { SupabaseClient } from "@supabase/supabase-js";

export type InvestorDuesFeeItem = {
  id: string;
  investor_property_id: string;
  periodKey: string;
  building: string;
  unit: string;
  type: "aidat";
  description: string;
  period: string;
  dueDate: string;
  amountFormatted: string;
  amountCents: number | null;
  currency: string | null;
  status: "paid" | "due" | "overdue";
  paid_at: string | null;
};

/** Generates period keys YYYY-MM from start (inclusive) to end (inclusive). */
function periodRange(startYYYYMM: string, endYYYYMM: string): string[] {
  const [sy, sm] = startYYYYMM.split("-").map(Number);
  const [ey, em] = endYYYYMM.split("-").map(Number);
  const out: string[] = [];
  let y = sy;
  let m = sm;
  while (y < ey || (y === ey && m <= em)) {
    out.push(`${y}-${String(m).padStart(2, "0")}`);
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return out;
}

/**
 * Builds a list of dues fee items for an investor: their units, building dues settings,
 * and paid/unpaid status per period. Periods start from the month each property was
 * registered (created_at), through the current month plus one month ahead.
 */
export async function getInvestorDuesFees(
  supabase: SupabaseClient,
  profileId: string
): Promise<InvestorDuesFeeItem[]> {
  const now = new Date();
  const endNext = new Date(now.getFullYear(), now.getMonth() + 2, 0);
  const endPeriodIncl =
    `${endNext.getFullYear()}-${String(endNext.getMonth() + 1).padStart(2, "0")}`;

  const { data: props, error: propsError } = await supabase
    .from("investor_properties")
    .select("id, building_id, block, unit, created_at")
    .eq("profile_id", profileId);

  if (propsError || !props?.length) return [];

  type PropRow = { id: string; building_id: string; block: string; unit: string; created_at: string };
  const propRows = props as PropRow[];

  const buildingIds = [...new Set(propRows.map((p) => p.building_id))];

  const { data: buildings } = await supabase
    .from("buildings")
    .select("id, name")
    .in("id", buildingIds);
  const buildingMap = new Map(
    (buildings ?? []).map((b) => [b.id, b.name ?? ""])
  );

  const { data: settingsRows } = await supabase
    .from("building_dues_settings")
    .select("building_id, payment_window_start_day, payment_window_end_day, amount_cents, currency")
    .in("building_id", buildingIds);
  const settingsByBuilding = new Map(
    (settingsRows ?? []).map((s) => [
      s.building_id,
      {
        start: s.payment_window_start_day ?? 1,
        end: s.payment_window_end_day ?? 31,
        amount_cents: s.amount_cents ?? null,
        currency: s.currency ?? "EUR",
      },
    ])
  );

  const propIds = propRows.map((p) => p.id);

  const allPeriodsSet = new Set<string>();
  const propPeriodsList: { prop: PropRow; periods: string[] }[] = [];
  for (const prop of propRows) {
    const created = prop.created_at ? new Date(prop.created_at) : new Date();
    const startPeriod =
      `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, "0")}`;
    const periods = periodRange(startPeriod, endPeriodIncl);
    periods.forEach((p) => allPeriodsSet.add(p));
    propPeriodsList.push({ prop, periods });
  }
  const allPeriods = [...allPeriodsSet];

  const { data: payments } = await supabase
    .from("dues_payments")
    .select("investor_property_id, period, paid_at")
    .in("investor_property_id", propIds)
    .in("period", allPeriods);
  const paidSet = new Set(
    (payments ?? []).map(
      (p) => `${p.investor_property_id}:${p.period}`
    )
  );
  const paidAtMap = new Map(
    (payments ?? []).map((p) => [`${p.investor_property_id}:${p.period}`, p.paid_at ?? null])
  );

  const items: InvestorDuesFeeItem[] = [];
  const currencySymbol: Record<string, string> = {
    EUR: "€",
    USD: "$",
    GBP: "£",
    TRY: "₺",
  };

  for (const { prop, periods } of propPeriodsList) {
    const buildingName = buildingMap.get(prop.building_id) ?? "Building";
    const unitLabel = `Block ${prop.block}, Unit ${prop.unit}`;
    const settings = settingsByBuilding.get(prop.building_id);
    const amountCents = settings?.amount_cents ?? null;
    const currency = settings?.currency ?? "EUR";
    const sym = currencySymbol[currency] ?? currency + " ";
    const amountFormatted =
      amountCents != null
        ? `${sym} ${(amountCents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
        : `${sym} —`;

    for (const period of periods) {
      const key = `${prop.id}:${period}`;
      const isPaid = paidSet.has(key);
      const paid_at = paidAtMap.get(key) ?? null;
      const [y, m] = period.split("-").map(Number);
      const endDay = settings?.end ?? 31;
      const dueDate = new Date(y, m - 1, Math.min(endDay, 28));
      const dueDateStr = dueDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueTime = new Date(dueDate);
      dueTime.setHours(0, 0, 0, 0);
      let status: "paid" | "due" | "overdue" = "due";
      if (isPaid) status = "paid";
      else if (dueTime < today) status = "overdue";

      const periodLabel = new Date(y, m - 1, 1).toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
      });

      items.push({
        id: key,
        investor_property_id: prop.id,
        periodKey: period,
        building: buildingName,
        unit: unitLabel,
        type: "aidat",
        description: "Monthly common charges (Aidat)",
        period: periodLabel,
        dueDate: dueDateStr,
        amountFormatted,
        amountCents,
        currency,
        status,
        paid_at,
      });
    }
  }

  items.sort((a, b) => {
    const periodCmp = a.id.split(":")[1].localeCompare(b.id.split(":")[1]);
    if (periodCmp !== 0) return periodCmp;
    return a.building.localeCompare(b.building) || a.unit.localeCompare(b.unit);
  });

  return items;
}
