import { redirect } from "next/navigation";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import {
  getBuildingDuesSettings,
  getUnitsForBuilding,
  getDuesPaymentsForBuildingAndPeriods,
  getPeriodsForBuildingFromEarliestUnit,
} from "@/lib/duesPayments";
import { DuesPaymentsClient } from "./DuesPaymentsClient";
import {
  setBuildingDuesSettingsAction,
  markDuesPaidAction,
  unmarkDuesPaidAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function StaffAidatPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ building?: string; period?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, company_id")
    .eq("id", session.user.id)
    .single();

  const role = profile?.role ?? "investor";
  if (role !== "staff" && role !== "admin") redirect("/dashboard");
  const companyId = profile?.company_id;
  if (!companyId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-gray-500">No company assigned. You cannot manage dues.</p>
      </div>
    );
  }

  const { building: paramBuilding } = await searchParams;

  const { data: buildings } = await supabase
    .from("buildings")
    .select("id, name")
    .eq("company_id", companyId)
    .order("name");

  const list = buildings ?? [];
  const selectedBuildingId =
    paramBuilding && list.some((b) => b.id === paramBuilding)
      ? paramBuilding
      : list[0]?.id ?? "";

  let settings: {
    payment_window_start_day: number;
    payment_window_end_day: number;
    amount_cents: number | null;
    currency: string | null;
    area_pricing: { min: number; max: number; amount_cents: number }[] | null;
  } | null = null;
  let units: Awaited<ReturnType<typeof getUnitsForBuilding>> = [];
  let periods: string[] = [];
  let paidByPeriod: Record<string, Record<string, { paid_at: string | null; marked_by: string | null }>> = {};

  if (selectedBuildingId) {
    const serviceClient = createServiceRoleClient();
    periods = await getPeriodsForBuildingFromEarliestUnit(serviceClient, selectedBuildingId);
    const [settingsResult, unitsResult, paidResult] = await Promise.all([
      getBuildingDuesSettings(supabase, selectedBuildingId),
      getUnitsForBuilding(serviceClient, selectedBuildingId),
      getDuesPaymentsForBuildingAndPeriods(serviceClient, selectedBuildingId, periods),
    ]);
    settings = settingsResult;
    units = unitsResult;
    paidByPeriod = paidResult;
  }

  return (
    <DuesPaymentsClient
      buildings={list.map((b) => ({ id: b.id, name: b.name }))}
      selectedBuildingId={selectedBuildingId}
      periods={periods}
      settings={settings}
      units={units}
      paidByPeriod={paidByPeriod}
      setSettingsFn={setBuildingDuesSettingsAction}
      markDuesPaidFn={markDuesPaidAction}
      unmarkDuesPaidFn={unmarkDuesPaidAction}
    />
  );
}
