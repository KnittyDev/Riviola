import { redirect } from "next/navigation";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getStaffCompanyId } from "@/lib/buildings";
import { getBuyerUnitsWithInstallments } from "@/lib/purchaseInstallments";
import { PurchasePaymentsClient } from "./PurchasePaymentsClient";

export const dynamic = "force-dynamic";

export default async function StaffPurchasePaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ building?: string; block?: string; unit?: string }>;
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
  const companyId = profile?.company_id ?? null;
  if (!companyId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-gray-500">No company assigned. You cannot manage purchase payments.</p>
      </div>
    );
  }

  const { building: paramBuilding, block: paramBlock, unit: paramUnit } = await searchParams;

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

  let units: Awaited<ReturnType<typeof getBuyerUnitsWithInstallments>> = [];

  if (selectedBuildingId) {
    const serviceClient = createServiceRoleClient();
    units = await getBuyerUnitsWithInstallments(serviceClient, selectedBuildingId, companyId);
  }

  const blocks = [...new Set(units.map((u) => u.block))].filter(Boolean).sort();
  const selectedBlock =
    paramBlock && blocks.includes(paramBlock) ? paramBlock : blocks[0] ?? "";

  const unitsInBlock = selectedBlock ? units.filter((u) => u.block === selectedBlock) : units;
  const selectedUnitId =
    paramUnit === "__all__"
      ? "__all__"
      : paramUnit && unitsInBlock.some((u) => u.id === paramUnit)
        ? paramUnit
        : unitsInBlock[0]?.id ?? "";

  return (
    <PurchasePaymentsClient
      buildings={list.map((b) => ({ id: b.id, name: b.name }))}
      selectedBuildingId={selectedBuildingId}
      blocks={blocks}
      selectedBlock={selectedBlock}
      selectedUnitId={selectedUnitId}
      units={units}
      unitsInBlock={unitsInBlock}
    />
  );
}
