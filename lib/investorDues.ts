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
  /** Reference number e.g. #12345678 when paid */
  payment_number: string | null;
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
  profileId: string,
  locale: string = "en"
): Promise<InvestorDuesFeeItem[]> {
  const now = new Date();
  const endNext = new Date(now.getFullYear(), now.getMonth() + 2, 0);
  const endPeriodIncl =
    `${endNext.getFullYear()}-${String(endNext.getMonth() + 1).padStart(2, "0")}`;

  const { data: props, error: propsError } = await supabase
    .from("investor_properties")
    .select("id, building_id, block, unit, created_at, area_m2")
    .eq("profile_id", profileId);

  if (propsError || !props?.length) return [];

  type PropRow = { id: string; building_id: string; block: string; unit: string; created_at: string; area_m2: number | null };
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
    .select("building_id, payment_window_start_day, payment_window_end_day, amount_cents, currency, area_pricing, is_active")
    .in("building_id", buildingIds);
  const settingsByBuilding = new Map(
    (settingsRows ?? []).map((s) => [
      s.building_id,
      {
        start: s.payment_window_start_day ?? 1,
        end: s.payment_window_end_day ?? 31,
        amount_cents: s.amount_cents ?? null,
        currency: s.currency ?? "EUR",
        area_pricing: s.area_pricing as { min: number; max: number; amount_cents: number }[] | null,
        is_active: s.is_active ?? true,
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
    .select("investor_property_id, period, paid_at, payment_number")
    .in("investor_property_id", propIds)
    .in("period", allPeriods);
  const paidSet = new Set(
    (payments ?? []).map(
      (p: { investor_property_id: string; period: string }) => `${p.investor_property_id}:${p.period}`
    )
  );
  const paidAtMap = new Map(
    (payments ?? []).map((p: { investor_property_id: string; period: string; paid_at: string | null }) => [
      `${p.investor_property_id}:${p.period}`,
      p.paid_at ?? null,
    ])
  );
  const paymentNumberMap = new Map(
    (payments ?? []).map((p: { investor_property_id: string; period: string; payment_number: string | null }) => [
      `${p.investor_property_id}:${p.period}`,
      p.payment_number ?? null,
    ])
  );

  const items: InvestorDuesFeeItem[] = [];
  const currencySymbol: Record<string, string> = {
    EUR: "€",
    USD: "$",
    GBP: "£",
    TRY: "₺",
    CHF: "Fr",
    AUD: "A$",
    CAD: "C$",
    NOK: "kr",
    SEK: "kr",
    AED: "د.إ",
    SAR: "﷼",
  };

  const dayLang = locale === "tr" ? "tr-TR" : locale === "sr" ? "sr-RS" : locale === "sq" ? "sq-AL" : locale === "pl" ? "pl-PL" : "en-GB";
  const numLang = locale === "tr" ? "tr-TR" : locale === "sr" ? "sr-RS" : locale === "sq" ? "sq-AL" : locale === "pl" ? "pl-PL" : "en-US";

  for (const { prop, periods } of propPeriodsList) {
    const buildingName = buildingMap.get(prop.building_id) ?? "Building";
    const unitLabel = locale === "tr"
      ? `${prop.block}. Blok, Daire ${prop.unit}`
      : `Block ${prop.block}, Unit ${prop.unit}`;
      
    const settings = settingsByBuilding.get(prop.building_id);
    if (settings && !settings.is_active) continue;

    let amountCents = settings?.amount_cents ?? null;
    
    if (settings?.area_pricing && settings.area_pricing.length > 0 && prop.area_m2 != null) {
      for (const tier of settings.area_pricing) {
        if (prop.area_m2 >= tier.min && prop.area_m2 <= tier.max) {
          amountCents = tier.amount_cents;
          break;
        }
      }
    }
    
    const currency = settings?.currency ?? "EUR";
    const sym = currencySymbol[currency] ?? currency + " ";
    const amountVal = amountCents != null ? amountCents / 100 : null;
    const amountFormatted =
      amountVal != null
        ? (locale === "tr" || sym === "€" || sym === "£" || sym === "₺"
            ? `${amountVal.toLocaleString(numLang, { minimumFractionDigits: 2 })} ${sym}`
            : `${sym}${amountVal.toLocaleString(numLang, { minimumFractionDigits: 2 })}`)
        : `${sym} —`;

    for (const period of periods) {
      const key = `${prop.id}:${period}`;
      const isPaid = paidSet.has(key);
      const paid_at = paidAtMap.get(key) ?? null;
      const payment_number = paymentNumberMap.get(key) ?? null;
      const [y, m] = period.split("-").map(Number);
      const endDay = settings?.end ?? 31;
      const dueDate = new Date(y, m - 1, Math.min(endDay, 28));
      const dueDateStr = dueDate.toLocaleDateString(dayLang, {
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

      const periodLabel = new Date(y, m - 1, 1).toLocaleDateString(dayLang, {
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
        description: locale === "tr" ? "Aylık aidat ödemesi" : "Monthly common charges (Aidat)",
        period: periodLabel,
        dueDate: dueDateStr,
        amountFormatted,
        amountCents,
        currency,
        status,
        paid_at,
        payment_number,
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

export type CompanyForInvoice = {
  name: string;
  logo_url: string | null;
};

/**
 * Returns the company (name, logo_url) for the investor's first property's building.
 * Used for PDF invoice header.
 */
export async function getCompanyForInvestorProfile(
  supabase: SupabaseClient,
  profileId: string
): Promise<CompanyForInvoice | null> {
  const { data: props } = await supabase
    .from("investor_properties")
    .select("building_id")
    .eq("profile_id", profileId)
    .limit(1);
  const first = (props ?? [])[0] as { building_id: string } | undefined;
  if (!first?.building_id) return null;
  const { data: building } = await supabase
    .from("buildings")
    .select("company_id")
    .eq("id", first.building_id)
    .single();
  const companyId = (building as { company_id: string } | null)?.company_id;
  if (!companyId) return null;
  const { data: company } = await supabase
    .from("companies")
    .select("name, logo_url")
    .eq("id", companyId)
    .single();
  if (!company) return null;
  return {
    name: (company as { name: string }).name ?? "",
    logo_url: (company as { logo_url: string | null }).logo_url ?? null,
  };
}
