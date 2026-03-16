"use client";

import { useEffect, useMemo, useState } from "react";
import type { BuildingStatus, StaffBuildingOverride } from "@/lib/staffBuildingOverrides";
import { readBuildingOverride } from "@/lib/staffBuildingOverrides";

function statusConfig(status: BuildingStatus) {
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

export function BuildingStatusBadgeClient({
  buildingId,
  fallbackStatus,
}: {
  buildingId: string;
  fallbackStatus: BuildingStatus;
}) {
  const [override, setOverride] = useState<StaffBuildingOverride | null>(null);

  useEffect(() => {
    setOverride(readBuildingOverride(buildingId));
  }, [buildingId]);

  const resolved = (override?.status ?? fallbackStatus) as BuildingStatus;
  const cfg = useMemo(() => statusConfig(resolved), [resolved]);

  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

export function BuildingProgressClient({
  buildingId,
  fallbackProgress,
}: {
  buildingId: string;
  fallbackProgress: number;
}) {
  const [override, setOverride] = useState<StaffBuildingOverride | null>(null);

  useEffect(() => {
    setOverride(readBuildingOverride(buildingId));
  }, [buildingId]);

  const progress = typeof override?.progress === "number" ? override.progress : fallbackProgress;

  return (
    <>
      <div className="flex-1 max-w-xs h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#134e4a] rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-sm font-bold text-[#134e4a]">{progress}%</span>
    </>
  );
}

export function NextMilestoneClient({
  buildingId,
  fallbackNextMilestone,
}: {
  buildingId: string;
  fallbackNextMilestone: string;
}) {
  const [override, setOverride] = useState<StaffBuildingOverride | null>(null);

  useEffect(() => {
    setOverride(readBuildingOverride(buildingId));
  }, [buildingId]);

  return <>{override?.nextMilestone ?? fallbackNextMilestone}</>;
}
