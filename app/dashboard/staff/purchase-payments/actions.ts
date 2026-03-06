"use server";

import { createClient } from "@/lib/supabase/server";
import { getStaffCompanyId } from "@/lib/buildings";

export type ActionResult = { ok?: boolean; error?: string };

async function assertStaffCanAccessInvestorProperty(
  supabase: Awaited<ReturnType<typeof createClient>>,
  investorPropertyId: string
): Promise<{ ok: true; companyId: string } | { ok: false; error: string }> {
  const companyId = await getStaffCompanyId(supabase);
  if (!companyId) return { ok: false, error: "Unauthorized" };

  const { data: prop, error } = await supabase
    .from("investor_properties")
    .select("building_id")
    .eq("id", investorPropertyId)
    .single();

  if (error || !prop) return { ok: false, error: "Unit not found" };

  const { data: building } = await supabase
    .from("buildings")
    .select("company_id")
    .eq("id", (prop as { building_id: string }).building_id)
    .single();

  if (!building || (building as { company_id: string }).company_id !== companyId)
    return { ok: false, error: "Not allowed for this unit" };

  return { ok: true, companyId };
}

export type CreatePlanInput = {
  investorPropertyId: string;
  planType: "full" | "installments";
  totalAmount: number;
  currency: string;
  /** Optional due date (YYYY-MM-DD) for full payment or first installment */
  dueDate?: string | null;
  /** For installments: number of installments (excluding down payment if any) */
  installmentCount?: number;
  /** For installments: down payment amount (optional) */
  downPaymentAmount?: number;
};

export async function createPurchasePlanAction(
  input: CreatePlanInput
): Promise<ActionResult> {
  const supabase = await createClient();
  const access = await assertStaffCanAccessInvestorProperty(supabase, input.investorPropertyId);
  if (!access.ok) return { error: access.error };

  const { investorPropertyId, planType, totalAmount, currency, dueDate, installmentCount = 0, downPaymentAmount = 0 } = input;

  const dueDateVal = dueDate?.trim() ? dueDate.trim() : null;

  if (planType === "full") {
    const { error } = await supabase.from("purchase_installments").insert({
      investor_property_id: investorPropertyId,
      sequence: 1,
      label: "Full payment",
      amount: totalAmount,
      currency: currency.trim() || "EUR",
      due_date: dueDateVal,
      updated_at: new Date().toISOString(),
    });
    if (error) return { error: error.message };
    return { ok: true };
  }

  const rows: Array<{
    investor_property_id: string;
    sequence: number;
    label: string;
    amount: number;
    currency: string;
    due_date: string | null;
    updated_at: string;
  }> = [];
  let seq = 1;

  if (downPaymentAmount > 0) {
    rows.push({
      investor_property_id: investorPropertyId,
      sequence: seq++,
      label: "Down payment",
      amount: downPaymentAmount,
      currency: currency.trim() || "EUR",
      due_date: dueDateVal,
      updated_at: new Date().toISOString(),
    });
  }

  const remaining = totalAmount - downPaymentAmount;
  const count = Math.max(1, installmentCount);
  const installmentAmount = Math.round((remaining / count) * 100) / 100;
  for (let i = 1; i <= count; i++) {
    const amount = i === count ? remaining - (count - 1) * installmentAmount : installmentAmount;
    rows.push({
      investor_property_id: investorPropertyId,
      sequence: seq++,
      label: `${i}${i === 1 ? "st" : i === 2 ? "nd" : i === 3 ? "rd" : "th"} installment`,
      amount: Math.round(amount * 100) / 100,
      currency: currency.trim() || "EUR",
      due_date: i === 1 ? dueDateVal : null,
      updated_at: new Date().toISOString(),
    });
  }

  const { error } = await supabase.from("purchase_installments").insert(rows);
  if (error) return { error: error.message };
  return { ok: true };
}

export async function markInstallmentPaidAction(installmentId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: row } = await supabase
    .from("purchase_installments")
    .select("investor_property_id")
    .eq("id", installmentId)
    .single();
  if (!row) return { error: "Installment not found" };

  const access = await assertStaffCanAccessInvestorProperty(supabase, (row as { investor_property_id: string }).investor_property_id);
  if (!access.ok) return { error: access.error };

  const { error } = await supabase
    .from("purchase_installments")
    .update({
      paid_at: new Date().toISOString(),
      marked_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", installmentId);

  if (error) return { error: error.message };
  return { ok: true };
}

export async function unmarkInstallmentPaidAction(installmentId: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: row } = await supabase
    .from("purchase_installments")
    .select("investor_property_id")
    .eq("id", installmentId)
    .single();
  if (!row) return { error: "Installment not found" };

  const access = await assertStaffCanAccessInvestorProperty(supabase, (row as { investor_property_id: string }).investor_property_id);
  if (!access.ok) return { error: access.error };

  const { error } = await supabase
    .from("purchase_installments")
    .update({
      paid_at: null,
      marked_by: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", installmentId);

  if (error) return { error: error.message };
  return { ok: true };
}

export async function deletePurchasePlanAction(investorPropertyId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const access = await assertStaffCanAccessInvestorProperty(supabase, investorPropertyId);
  if (!access.ok) return { error: access.error };

  const { error } = await supabase
    .from("purchase_installments")
    .delete()
    .eq("investor_property_id", investorPropertyId);

  if (error) return { error: error.message };
  return { ok: true };
}
