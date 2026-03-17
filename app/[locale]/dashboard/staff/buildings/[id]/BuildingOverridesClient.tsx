"use client";

import type { BuildingStatus } from "@/lib/supabase/types";
import { useTranslations } from "next-intl";

function statusConfig(status: BuildingStatus) {
  switch (status) {
    case "Planned":
      return { key: "planned", className: "bg-sky-100 text-sky-700" };
    case "In progress":
      return { key: "inProgress", className: "bg-amber-100 text-amber-700" };
    case "At risk":
      return { key: "atRisk", className: "bg-red-100 text-red-700" };
    case "On hold":
      return { key: "onHold", className: "bg-gray-100 text-gray-700" };
    case "Completed":
      return { key: "completed", className: "bg-emerald-100 text-emerald-700" };
    case "Cancelled":
      return { key: "cancelled", className: "bg-zinc-100 text-zinc-700" };
    default:
      return { key: "planned", className: "bg-sky-100 text-sky-700" };
  }
}

export function BuildingStatusBadgeClient({ status }: { status: BuildingStatus }) {
  const t = useTranslations("Statuses");
  const cfg = statusConfig(status);
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${cfg.className}`}>
      {t(cfg.key)}
    </span>
  );
}

export function BuildingProgressClient({ progress }: { progress: number }) {
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

export function NextMilestoneClient({ nextMilestone }: { nextMilestone: string }) {
  return <>{nextMilestone}</>;
}
