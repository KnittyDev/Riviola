import { createClient } from "@/lib/supabase/server";
import { getStaffCompanyId } from "@/lib/buildings";
import { redirect } from "next/navigation";
import { NewInvestorForm } from "@/components/dashboard/staff/NewInvestorForm";
import type { Building } from "@/lib/supabase/types";

export default async function NewInvestorPage() {
  const supabase = await createClient();
  const companyId = await getStaffCompanyId(supabase);
  if (!companyId) redirect("/dashboard/staff");

  const { data: rows } = await supabase
    .from("buildings")
    .select("id, name, location, blocks, floors")
    .eq("company_id", companyId)
    .order("name");

  const buildings = (rows ?? []).map((r) => {
    const b = r as Pick<Building, "id" | "name" | "location" | "blocks" | "floors">;
    return {
      id: b.id,
      name: b.name,
      location: b.location ?? null,
      blocks: Array.isArray(b.blocks) ? b.blocks : [],
      floors: typeof b.floors === "number" ? b.floors : 1,
    };
  });

  return <NewInvestorForm buildings={buildings} />;
}
