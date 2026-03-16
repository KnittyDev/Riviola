"use client";

import type { ProgressMilestoneLog } from "@/lib/staffBuildingsData";

function formatMilestoneDateTime(dateTimeStr: string): { day: string; date: string; time: string } {
  const d = new Date(dateTimeStr);
  const day = d.toLocaleDateString("en-GB", { weekday: "long" });
  const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
  return { day, date, time };
}

interface BuildingMilestonesLogProps {
  milestones: ProgressMilestoneLog[];
  currentMilestoneId?: string | null;
}

export function BuildingMilestonesLog({ milestones, currentMilestoneId = null }: BuildingMilestonesLogProps) {
  if (milestones.length === 0) {
    return (
      <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
        <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-gray-100 text-gray-400 mb-4">
          <i className="las la-flag-checkered text-2xl" aria-hidden />
        </div>
        <p className="text-gray-600 font-medium">No milestones for this building yet.</p>
        <p className="text-sm text-gray-400 mt-1">Add planned milestones when editing the building to see them here.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up">
      <div className="p-6 sm:p-8 border-b border-gray-100 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-[#134e4a]/10 flex items-center justify-center">
            <i className="las la-flag-checkered text-xl text-[#134e4a]" aria-hidden />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Milestones
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">Chronological list of milestones for this building.</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative py-4 px-4 sm:px-6">
        <ul className="relative space-y-0">
          {milestones.map((m, index) => {
            const detailed = m.dateTime ? formatMilestoneDateTime(m.dateTime) : null;
            const isLast = index === milestones.length - 1;
            const isCurrent = currentMilestoneId != null && currentMilestoneId === m.id;
            return (
              <li key={m.id} className="relative flex items-center gap-4 sm:gap-5">
                {/* Timeline dot */}
                <div className="relative z-10 shrink-0 w-14 sm:w-16 flex items-center justify-center self-center">
                  <div
                    className={`size-3 rounded-full border-2 border-white shrink-0 ${
                      isLast ? "bg-[#134e4a]" : "bg-[#134e4a]/80"
                    } ${isCurrent ? "ring-4 ring-[#134e4a]/30" : "ring-4 ring-[#134e4a]/10"}`}
                  />
                </div>
                {/* Content card */}
                <div className="flex-1 min-w-0 py-2">
                  <div className={`rounded-xl border transition-all duration-200 p-4 sm:p-5 ${
                    isCurrent
                      ? "border-[#134e4a]/40 bg-[#134e4a]/5 hover:bg-[#134e4a]/10 hover:border-[#134e4a]/50"
                      : "border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200"
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-gray-900 text-sm sm:text-base leading-snug">
                            {m.label}
                          </p>
                          {isCurrent && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-[#134e4a] text-white">
                              <i className="las la-flag text-[10px]" aria-hidden />
                              Current
                            </span>
                          )}
                        </div>
                        {detailed && (
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                            <span className="inline-flex items-center gap-1.5">
                              <i className="las la-calendar-day text-gray-400" aria-hidden />
                              {detailed.day}, {detailed.date}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <i className="las la-clock text-gray-400" aria-hidden />
                              {detailed.time}
                            </span>
                          </div>
                        )}
                        {!detailed && (
                          <p className="text-xs text-gray-500 mt-1.5">{m.date}</p>
                        )}
                      </div>
                      {detailed && (
                        <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200">
                          <span className="text-xs font-medium text-gray-700">{detailed.time}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-600">{detailed.day}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
