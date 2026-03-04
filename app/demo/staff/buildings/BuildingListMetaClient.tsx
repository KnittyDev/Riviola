"use client";

import { useEffect, useMemo, useState } from "react";
import type { BuildingStatus, StaffBuildingOverride } from "@/lib/staffBuildingOverrides";
import { readBuildingOverride } from "@/lib/staffBuildingOverrides";

function statusClass(status: BuildingStatus) {
  switch (status) {
    case "Planned":
      return { label: "Planned", className: "bg-sky-100 text-sky-700" };
    case "In progress":
      return { label: "In progress", className: "bg-amber-100 text-amber-700" };
    case "At risk":
      return { label: "At risk", className: "bg-red-100 text-red-700" };
    case "On hold":
      return { label: "On hold", className: "bg-gray-100 text-gray-700" };
    case "Completed":
      return { label: "Completed", className: "bg-emerald-100 text-emerald-700" };
    case "Cancelled":
      return { label: "Cancelled", className: "bg-zinc-100 text-zinc-700" };
  }
}

export function BuildingListMetaClient({
  buildingId,
  fallbackProgress,
  fallbackStatus,
}: {
  buildingId: string;
  fallbackProgress: number;
  fallbackStatus: BuildingStatus;
}) {
  const [override, setOverride] = useState<StaffBuildingOverride | null>(null);

  useEffect(() => {
    setOverride(readBuildingOverride(buildingId));
  }, [buildingId]);

  const progress = typeof override?.progress === "number" ? override.progress : fallbackProgress;
  const resolvedStatus = (override?.status ?? fallbackStatus) as BuildingStatus;
  const cfg = useMemo(() => statusClass(resolvedStatus), [resolvedStatus]);

  return (
    <>
      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-[#134e4a] rounded-full" style={{ width: `${progress}%` }} />
      </div>
      <span className="text-sm font-bold text-[#134e4a] w-10">{progress}%</span>
      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${cfg.className}`}>
        {cfg.label}
      </span>
    </>
  );
}
