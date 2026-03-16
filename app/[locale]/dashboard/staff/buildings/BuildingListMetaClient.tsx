"use client";

import type { BuildingStatus } from "@/lib/supabase/types";
import { useTranslations } from "next-intl";

function useStatusConfig(status: BuildingStatus) {
  const t = useTranslations("Statuses");
  switch (status) {
    case "Planned":
      return { label: t("planned"), className: "bg-sky-100 text-sky-700" };
    case "In progress":
      return { label: t("inProgress"), className: "bg-amber-100 text-amber-700" };
    case "At risk":
      return { label: t("atRisk"), className: "bg-red-100 text-red-700" };
    case "On hold":
      return { label: t("onHold"), className: "bg-gray-100 text-gray-700" };
    case "Completed":
      return { label: t("completed"), className: "bg-emerald-100 text-emerald-700" };
    case "Cancelled":
      return { label: t("cancelled"), className: "bg-zinc-100 text-zinc-700" };
  }
}

export function BuildingListMetaClient({
  progress,
  status,
}: {
  progress: number;
  status: BuildingStatus;
}) {
  const cfg = useStatusConfig(status);
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
