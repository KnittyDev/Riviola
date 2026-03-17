import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getStaffCompanyId } from "@/lib/buildings";
import { notFound } from "next/navigation";
import { EditBuildingForm } from "./EditBuildingForm";
import type { Building } from "@/lib/supabase/types";
import { getTranslations } from "next-intl/server";

export default async function EditBuildingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("EditBuilding");
  const supabase = await createClient();
  const companyId = await getStaffCompanyId(supabase);
  if (!companyId) notFound();

  const { data: row } = await supabase
    .from("buildings")
    .select("*")
    .eq("id", id)
    .eq("company_id", companyId)
    .single();

  if (!row) notFound();
  const building = row as Building;

  const blocks = Array.isArray(building.blocks) && building.blocks.length > 0
    ? building.blocks
    : [t("defaultBlock")];
  const plannedMilestones = Array.isArray(building.planned_milestones)
    ? building.planned_milestones
    : [];

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <Link
        href={`/dashboard/staff/buildings/${id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#134e4a] mb-6"
      >
        <i className="las la-arrow-left" aria-hidden />
        {t("backToBuilding")}
      </Link>
      <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
        {t("title")}
      </h1>
      <p className="text-gray-500 mt-1 mb-8">
        {t("subtitle")}
      </p>
      <EditBuildingForm
        id={building.id}
        defaultName={building.name}
        defaultLocation={building.location ?? ""}
        defaultUnits={building.units}
        defaultStatus={building.status}
        defaultProgress={building.progress}
        defaultBlocks={blocks}
        defaultFloors={building.floors}
        defaultImageUrl={building.image_url}
        defaultCountry={building.country}
        defaultCity={building.city}
        defaultPlannedMilestones={plannedMilestones}
        defaultCurrentMilestoneId={building.current_milestone_id ?? null}
        defaultSustainabilityScore={building.sustainability_score ?? 0}
        defaultSustainabilityFeatures={building.sustainability_features ?? []}
      />
    </div>
  );
}
