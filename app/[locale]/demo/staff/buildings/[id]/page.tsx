import Link from "next/link";
import Image from "next/image";
import { getBuildingById, getBuildingMilestones } from "@/lib/staffBuildingsData";
import { notFound } from "next/navigation";
import { BuildingMilestonesLog } from "./BuildingMilestonesLog";
import { BuildingProgressClient, BuildingStatusBadgeClient, NextMilestoneClient } from "./BuildingOverridesClient";
import type { BuildingStatus } from "@/lib/staffBuildingOverrides";

import { WeeklyPhotoUpdates } from "@/components/WeeklyPhotoUpdates";
import type { WeeklyPhotoUpdate } from "@/lib/propertyDetailData";

export default async function StaffBuildingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const building = getBuildingById(id);
  if (!building) notFound();

  // Mock weekly photo data for the demo
  const sampleWeeklyUpdates: WeeklyPhotoUpdate[] = [
    {
      id: "up-1",
      weekLabel: "Week 51",
      range: "12 Dec — 19 Dec 2025",
      description: "Final touches on the facade and interior flooring for the common areas.",
      images: [
        { url: building.imageUrl, alt: "Building Facade" },
        { url: "https://yklvleoalhkoqncahalg.supabase.co/storage/v1/object/public/building_banners/fe7cad0d-b72f-43e9-b2b3-a68a36596450.jpg", alt: "Alternative View" }
      ],
    },
    {
      id: "up-2",
      weekLabel: "Week 44",
      range: "25 Oct — 01 Nov 2025",
      description: "Structural work completed up to the top floor. Window installation started.",
      images: [
        { url: "https://yklvleoalhkoqncahalg.supabase.co/storage/v1/object/public/building_banners/fe7cad0d-b72f-43e9-b2b3-a68a36596450.jpg", alt: "Structural View" }
      ],
    },
    {
      id: "up-3",
      weekLabel: "Week 41",
      range: "04 Oct — 11 Oct 2025",
      description: "Foundation and lower floor concrete pouring completed.",
      images: [
        { url: building.imageUrl, alt: "Site Progress" }
      ],
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link
        href="/demo/staff/buildings"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#134e4a] mb-6"
      >
        <i className="las la-arrow-left" aria-hidden />
        Back to buildings
      </Link>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="relative w-full h-32 sm:h-36 bg-gray-100">
          <Image
            src={building.imageUrl}
            alt={building.name}
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
          />
        </div>
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">{building.name}</h1>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Link
              href={`/demo/staff/weekly-photos/new?buildingId=${id}`}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-[#134e4a] text-white text-xs sm:text-sm font-semibold hover:bg-[#115e59] transition-colors"
            >
              <i className="las la-camera text-sm sm:text-base" aria-hidden />
              Add weekly photo
            </Link>
            <Link
              href={`/demo/staff/buildings/${id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl border border-gray-200 text-gray-700 text-xs sm:text-sm font-semibold hover:bg-gray-50 hover:border-[#134e4a] hover:text-[#134e4a] transition-colors"
            >
              <i className="las la-pen text-sm" aria-hidden />
              Edit
            </Link>
          </div>
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

      <div className="mt-8">
        <WeeklyPhotoUpdates weeklyUpdates={sampleWeeklyUpdates} />
      </div>

      <div className="mt-8">
        <BuildingMilestonesLog buildingId={id} milestones={getBuildingMilestones(id)} />
      </div>
    </div>
  );
}
