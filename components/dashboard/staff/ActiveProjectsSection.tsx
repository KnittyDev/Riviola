"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

const DEFAULT_PLACEHOLDER = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80";
const DEFAULT_BASE = "/dashboard/staff";

type BuildingItem = {
  id: string;
  name: string;
  location: string | null;
  status: string;
  progress: number;
  image_url: string | null;
};

export function ActiveProjectsSection({
  buildings = [],
  basePath = DEFAULT_BASE,
}: {
  buildings?: BuildingItem[];
  basePath?: string;
}) {
  const t = useTranslations("Staff.projects");
  const list = buildings ?? [];
  const activeBuildings = list.filter((b) => b.status === "In progress");
  const displayBuildings = activeBuildings.length > 0 ? activeBuildings : list;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">{t("title")}</h3>
        <Link
          href={`${basePath}/buildings`}
          className="text-sm font-semibold text-[#134e4a] hover:text-[#115e59]"
        >
          {t("viewAll")}
        </Link>
      </div>
      {list.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-8 text-center">
          <p className="text-gray-500 font-medium">{t("noBuildings")}</p>
          <Link
            href={`${basePath}/buildings/new`}
            className="inline-flex items-center gap-2 mt-2 text-sm font-semibold text-[#134e4a] hover:text-[#115e59]"
          >
            {t("addBuilding")}
          </Link>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 scrollbar-thin">
          {displayBuildings.map((b) => (
            <Link
              key={b.id}
              href={`${basePath}/buildings/${b.id}`}
              className="group shrink-0 w-64 rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-[4/3] bg-gray-100">
                <Image
                  src={b.image_url || DEFAULT_PLACEHOLDER}
                  alt={b.name}
                  fill
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-200"
                  sizes="256px"
                />
                <div
                  className={`absolute bottom-3 left-3 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${b.status === "Completed"
                      ? "bg-emerald-600 text-white"
                      : "bg-[#134e4a] text-white"
                    }`}
                >
                  {b.status === "Completed" ? t("completed") : b.name.toUpperCase()}
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900 truncate">{b.name}</p>
                    <p className="text-xs text-gray-500">{t("percentComplete", { percent: b.progress })}</p>
                  </div>
                  <div className="shrink-0 flex items-center justify-center size-8 rounded-lg bg-gray-50 group-hover:bg-[#134e4a] group-hover:text-white transition-colors">
                    <i className="las la-arrow-right text-xs" aria-hidden />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
