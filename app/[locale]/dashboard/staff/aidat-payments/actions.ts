"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import {
  setBuildingDuesSettings,
  markDuesPaid,
  unmarkDuesPaid,
  type BuildingDuesSettingsInput,
} from "@/lib/duesPayments";
import { getStaffCompanyId } from "@/lib/buildings";

export type ActionResult = { ok?: boolean; error?: string };

export async function setBuildingDuesSettingsAction(
  buildingId: string,
  input: BuildingDuesSettingsInput
): Promise<ActionResult> {
  const supabase = await createClient();
  const companyId = await getStaffCompanyId(supabase);
  if (!companyId) return { error: "Unauthorized" };

  const ok = await setBuildingDuesSettings(supabase, buildingId, input);
  if (!ok) return { error: "Failed to save settings" };
  return { ok: true };
}

export async function markDuesPaidAction(
  investorPropertyId: string,
  period: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return { error: "Not authenticated" };

  const ok = await markDuesPaid(supabase, investorPropertyId, period, session.user.id);
  if (!ok) return { error: "Failed to mark as paid" };
  return { ok: true };
}

export async function unmarkDuesPaidAction(
  investorPropertyId: string,
  period: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return { error: "Not authenticated" };

  const ok = await unmarkDuesPaid(supabase, investorPropertyId, period);
  if (!ok) return { error: "Failed to unmark" };
  return { ok: true };
}
