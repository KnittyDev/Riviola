import type { SupabaseClient } from "@supabase/supabase-js";
import type { PurchaseInstallment } from "@/lib/supabase/types";

export type PurchaseInstallmentWithProperty = PurchaseInstallment & {
  building_name: string;
  block: string;
  unit: string;
};

/**
 * Fetches all purchase installments for an investor (buyer), for use on Financials page.
 * Returns installments with building/block/unit for display.
 */
export async function getPurchaseInstallmentsForInvestor(
  supabase: SupabaseClient,
  profileId: string
): Promise<PurchaseInstallmentWithProperty[]> {
  const { data: props, error: propsError } = await supabase
    .from("investor_properties")
    .select("id")
    .eq("profile_id", profileId);

  if (propsError || !props?.length) return [];

  const propertyIds = (props as { id: string }[]).map((p) => p.id);

  const { data: rows, error: rowsError } = await supabase
    .from("purchase_installments")
    .select("id, investor_property_id, sequence, label, amount, currency, due_date, paid_at, marked_by, receipt_document_url, created_at, updated_at")
    .in("investor_property_id", propertyIds)
    .order("investor_property_id")
    .order("sequence");

  if (rowsError || !rows?.length) return [];

  const buildingIds = await getBuildingIdsForInvestorProperties(supabase, propertyIds);
  const { data: buildings } = await supabase
    .from("buildings")
    .select("id, name")
    .in("id", buildingIds);
  const buildingMap = new Map((buildings ?? []).map((b) => [b.id, (b as { name: string }).name ?? ""]));

  const propRows = await getInvestorPropertyDetails(supabase, propertyIds);
  const propMap = new Map(propRows.map((p) => [p.id, p]));

  return (rows as PurchaseInstallment[]).map((r) => {
    const prop = propMap.get(r.investor_property_id);
    const buildingName = prop ? buildingMap.get(prop.building_id) ?? "" : "";
    return {
      ...r,
      building_name: buildingName,
      block: prop?.block ?? "",
      unit: prop?.unit ?? "",
    };
  });
}

async function getBuildingIdsForInvestorProperties(
  supabase: SupabaseClient,
  propertyIds: string[]
): Promise<string[]> {
  const { data } = await supabase
    .from("investor_properties")
    .select("building_id")
    .in("id", propertyIds);
  return [...new Set((data ?? []).map((d: { building_id: string }) => d.building_id))];
}

async function getInvestorPropertyDetails(
  supabase: SupabaseClient,
  propertyIds: string[]
): Promise<Array<{ id: string; building_id: string; block: string; unit: string }>> {
  const { data } = await supabase
    .from("investor_properties")
    .select("id, building_id, block, unit")
    .in("id", propertyIds);
  return (data ?? []) as Array<{ id: string; building_id: string; block: string; unit: string }>;
}

/** Single buyer unit row for staff purchase-payments page */
export type BuyerUnitRow = {
  id: string;
  profile_id: string;
  full_name: string | null;
  block: string;
  unit: string;
  purchase_value: number | null;
  purchase_currency: string | null;
};

/** Buyer unit with its installments for staff page */
export type BuyerUnitWithInstallments = BuyerUnitRow & {
  installments: PurchaseInstallment[];
};

/**
 * Fetches buyer-type investors' units for a building and their purchase installments.
 * Used on staff purchase-payments page.
 */
export async function getBuyerUnitsWithInstallments(
  supabase: SupabaseClient,
  buildingId: string,
  companyId: string | null
): Promise<BuyerUnitWithInstallments[]> {
  if (!companyId) return [];

  const { data: building } = await supabase
    .from("buildings")
    .select("company_id")
    .eq("id", buildingId)
    .single();
  if (!building || (building as { company_id: string }).company_id !== companyId) return [];

  const { data: propRows, error: propError } = await supabase
    .from("investor_properties")
    .select("id, profile_id, block, unit, purchase_value, purchase_currency")
    .eq("building_id", buildingId)
    .order("block")
    .order("unit");

  if (propError || !propRows?.length) return [];

  const profileIds = [...new Set((propRows as { profile_id: string }[]).map((p) => p.profile_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, investor_type")
    .in("id", profileIds);
  const buyerProfileIds = new Set(
    (profiles ?? []).filter((p: { investor_type: string | null }) => p.investor_type === "buyer").map((p: { id: string }) => p.id)
  );

  const buyerProps = (propRows as Array<{ id: string; profile_id: string; block: string; unit: string; purchase_value: number | null; purchase_currency: string | null }>).filter(
    (p) => buyerProfileIds.has(p.profile_id)
  );
  if (!buyerProps.length) return [];

  const { data: profileNames } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", profileIds);
  const nameMap = new Map((profileNames ?? []).map((p: { id: string; full_name: string | null }) => [p.id, p.full_name]));

  const propertyIds = buyerProps.map((p) => p.id);
  const { data: installmentsRows, error: instError } = await supabase
    .from("purchase_installments")
    .select("id, investor_property_id, sequence, label, amount, currency, due_date, paid_at, marked_by, receipt_document_url, created_at, updated_at")
    .in("investor_property_id", propertyIds)
    .order("sequence");

  const installments = (instError ? [] : (installmentsRows ?? [])) as PurchaseInstallment[];
  const byProperty = new Map<string, PurchaseInstallment[]>();
  for (const i of installments) {
    const list = byProperty.get(i.investor_property_id) ?? [];
    list.push(i);
    byProperty.set(i.investor_property_id, list);
  }

  return buyerProps.map((p) => ({
    id: p.id,
    profile_id: p.profile_id,
    full_name: nameMap.get(p.profile_id) ?? null,
    block: p.block,
    unit: p.unit,
    purchase_value: p.purchase_value,
    purchase_currency: p.purchase_currency,
    installments: (byProperty.get(p.id) ?? []).sort((a, b) => a.sequence - b.sequence),
  }));
}
