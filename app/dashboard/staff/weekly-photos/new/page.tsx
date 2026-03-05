import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getStaffCompanyId } from "@/lib/buildings";
import { redirect } from "next/navigation";
import { NewWeeklyPhotoForm } from "@/components/dashboard/staff/NewWeeklyPhotoForm";
import type { Building } from "@/lib/supabase/types";

export default async function NewWeeklyPhotoPage() {
  const supabase = await createClient();
  const companyId = await getStaffCompanyId(supabase);
  if (!companyId) redirect("/dashboard/staff");

  const { data: rows } = await supabase
    .from("buildings")
    .select("id, name, location, blocks")
    .eq("company_id", companyId)
    .order("name");

  const buildings = (rows ?? []).map((r) => {
    const b = r as Pick<Building, "id" | "name" | "location" | "blocks">;
    return {
      id: b.id,
      name: b.name,
      location: b.location ?? null,
      blocks: Array.isArray(b.blocks) ? b.blocks : [],
    };
  });

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <i className="las la-spinner animate-spin text-4xl text-[#134e4a]" aria-hidden />
        </div>
      }
    >
      <NewWeeklyPhotoForm buildings={buildings} />
    </Suspense>
  );
}
