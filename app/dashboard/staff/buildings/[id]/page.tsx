import Link from "next/link";
import Image from "next/image";
import { getBuildingById, getBuildingMilestones } from "@/lib/staffBuildingsData";
import { notFound } from "next/navigation";
import { BuildingMilestonesLog } from "./BuildingMilestonesLog";
import { BuildingProgressClient, BuildingStatusBadgeClient, NextMilestoneClient } from "./BuildingOverridesClient";
import type { BuildingStatus } from "@/lib/staffBuildingOverrides";

export default async function StaffBuildingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const building = getBuildingById(id);
  if (!building) notFound();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <Link
        href="/dashboard/staff/buildings"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#134e4a] mb-6"
      >
        <i className="las la-arrow-left" aria-hidden />
        Back to buildings
      </Link>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="relative w-full h-56 sm:h-72 bg-gray-100">
          <Image
            src={building.imageUrl}
            alt={building.name}
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 1280px"
            priority
          />
        </div>
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-gray-900">{building.name}</h1>
          <Link
            href={`/dashboard/staff/buildings/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#134e4a] text-white text-sm font-semibold hover:bg-[#115e59] transition-colors"
          >
            <i className="las la-pen" aria-hidden />
            Edit building
          </Link>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</p>
            <p className="text-gray-900 font-medium flex items-center gap-1 mt-0.5">
              <i className="las la-map-marker-alt text-gray-400" aria-hidden />
              {building.location}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Units</p>
            <p className="text-gray-900 font-medium">{building.units}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Progress</p>
            <div className="flex items-center gap-3">
              <BuildingProgressClient buildingId={id} fallbackProgress={building.progress} />
              <BuildingStatusBadgeClient buildingId={id} fallbackStatus={building.status as BuildingStatus} />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Next milestone</p>
            <p className="text-gray-700 mt-0.5">
              <NextMilestoneClient buildingId={id} fallbackNextMilestone={building.nextMilestone} />
            </p>
          </div>
        </div>
      </div>

      <BuildingMilestonesLog buildingId={id} milestones={getBuildingMilestones(id)} />
    </div>
  );
}
