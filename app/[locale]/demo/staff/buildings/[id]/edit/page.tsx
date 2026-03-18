import Link from "next/link";
import { buildingBlocks, buildingFloors, getBuildingById } from "@/lib/staffBuildingsData";
import { notFound } from "next/navigation";
import { EditBuildingForm } from "@/app/[locale]/dashboard/staff/buildings/[id]/edit/EditBuildingForm";
import { getTranslations } from "next-intl/server";

export default async function EditBuildingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const building = getBuildingById(id);
  if (!building) notFound();

  const t = await getTranslations("Demo.buildings.editPage");

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link
        href={`/demo/staff/buildings/${id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#134e4a] mb-6"
      >
        <i className="las la-arrow-left" aria-hidden />
        {t("back")}
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
        defaultLocation={building.location}
        defaultUnits={building.units}
        defaultStatus={building.status}
        defaultProgress={building.progress}
        defaultBlocks={buildingBlocks[building.id] ?? ["Block A"]}
        defaultFloors={buildingFloors[building.id] ?? 1}
        basePath="/demo/staff"
      />
    </div>
  );
}
