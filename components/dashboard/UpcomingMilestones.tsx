"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { InvestorUpcomingMilestoneItem } from "@/lib/investorProperties";

interface UpcomingMilestonesProps {
  milestones?: InvestorUpcomingMilestoneItem[];
}

export function UpcomingMilestones({ milestones: propMilestones = [] }: UpcomingMilestonesProps) {
  const [liveSeconds, setLiveSeconds] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setLiveSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header with accent + LIVE */}
      <div className="relative px-6 pt-6 pb-2">
        <div className="absolute top-0 left-0 w-1 h-full min-h-[120px] bg-gradient-to-b from-[#134e4a] to-teal-400/60 rounded-l-2xl" />
        <div className="flex items-center justify-between gap-3 pl-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-[#134e4a]/10 flex items-center justify-center shrink-0">
              <i className="las la-flag-checkered text-[#134e4a] text-xl" aria-hidden />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h5 className="text-lg font-bold text-gray-900">
                  Upcoming Milestones
                </h5>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-50 border border-red-100">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                  </span>
                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Live</span>
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {liveSeconds === 0 ? "Updated just now" : `Updated ${liveSeconds}s ago`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline with connecting line */}
      <div className="px-6 py-4 flex-1">
        <div className="relative">
          {propMilestones.length > 1 && (
            <div
              className="absolute left-[11px] top-3 bottom-8 w-0.5 bg-gray-200 rounded-full"
              aria-hidden
            />
          )}
          <div className="space-y-0">
            {propMilestones.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">No upcoming milestones for your properties yet.</p>
            ) : (
              propMilestones.map((m, i) => (
                <div key={`${m.date}-${m.title}-${i}`} className="relative flex gap-4 pb-5 last:pb-0">
                  {/* Dot - centered on timeline line */}
                  <div className="relative z-10 flex shrink-0 w-6 justify-center items-start pt-0.5">
                    <div
                      className={`flex items-center justify-center rounded-full transition-all shrink-0 ${
                        m.active
                          ? "size-5 bg-[#134e4a] shadow-md shadow-[#134e4a]/30 milestone-dot-active ring-4 ring-[#134e4a]/10"
                          : "size-[14px] bg-gray-200 mt-1.5"
                      }`}
                    >
                      {m.active && (
                        <span className="size-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0">
                    <p
                      className={`text-[10px] font-bold uppercase tracking-widest ${
                        m.active ? "text-[#134e4a]" : "text-gray-400"
                      }`}
                    >
                      {m.date}
                    </p>
                    <p
                      className={`text-sm font-bold mt-0.5 ${
                        m.active ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {m.title}
                    </p>
                    {m.building_name && (
                      <p className="text-xs text-gray-400 mt-0.5">{m.building_name}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Button */}
      <div className="p-4 pt-2 border-t border-gray-100 bg-gray-50/50">
        <Link
          href="/dashboard/properties"
          className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#134e4a] text-white text-sm font-bold hover:bg-[#115e59] transition-colors shadow-sm"
        >
          View properties
          <i className="las la-arrow-right text-base" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
