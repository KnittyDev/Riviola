import { redirect } from "next/navigation";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import {
  getBuildingDuesSettings,
  getUnitsForBuilding,
  getDuesPaymentsForBuildingAndPeriod,
} from "@/lib/duesPayments";
import { DuesPaymentsClient } from "./DuesPaymentsClient";

export const dynamic = "force-dynamic";

function getDefaultPeriod(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

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

  const { building: paramBuilding, period: paramPeriod } = await searchParams;

  const { data: buildings } = await supabase
    .from("buildings")
    .select("id, name")
    .eq("company_id", companyId)
    .order("name");

  const list = buildings ?? [];
  const selectedBuildingId = paramBuilding && list.some((b) => b.id === paramBuilding)
    ? paramBuilding
    : list[0]?.id ?? "";
  const period = paramPeriod && /^\d{4}-\d{2}$/.test(paramPeriod)
    ? paramPeriod
    : getDefaultPeriod();

  let settings: { payment_window_start_day: number; payment_window_end_day: number; amount_cents: number | null; currency: string | null } | null = null;
  let units: Awaited<ReturnType<typeof getUnitsForBuilding>> = [];
  let paidRecord: Record<string, { paid_at: string | null; marked_by: string | null }> = {};

  if (selectedBuildingId) {
    const serviceClient = createServiceRoleClient();
    const [settingsResult, unitsResult, paidResult] = await Promise.all([
      getBuildingDuesSettings(supabase, selectedBuildingId),
      getUnitsForBuilding(serviceClient, selectedBuildingId),
      getDuesPaymentsForBuildingAndPeriod(serviceClient, selectedBuildingId, period),
    ]);
    settings = settingsResult;
    units = unitsResult;
    paidResult.forEach((v, k) => {
      paidRecord[k] = v;
    });
  }

  return (
    <DuesPaymentsClient
      buildings={list.map((b) => ({ id: b.id, name: b.name }))}
      selectedBuildingId={selectedBuildingId}
      period={period}
      settings={settings}
      units={units}
      paidRecord={paidRecord}
    />
  );
}
