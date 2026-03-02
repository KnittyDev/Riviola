"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { BuildingStatus, PlannedMilestone } from "@/lib/staffBuildingOverrides";
import { readBuildingOverride, writeBuildingOverride } from "@/lib/staffBuildingOverrides";

type Props = {
  id: string;
  defaultName: string;
  defaultLocation: string;
  defaultUnits: number;
  defaultStatus: BuildingStatus;
  defaultProgress: number;
  defaultNextMilestone: string;
  defaultBlocks: string[];
  defaultFloors: number;
};

const statusOptions: Array<{
  value: BuildingStatus;
  label: string;
  helper: string;
  icon: string;
  toneClass: string;
}> = [
  {
    value: "Planned",
    label: "Planned",
    helper: "Preparing to start",
    icon: "las la-calendar",
    toneClass: "bg-sky-100 text-sky-700",
  },
  {
    value: "In progress",
    label: "In progress",
    helper: "Construction ongoing",
    icon: "las la-hourglass-half",
    toneClass: "bg-amber-100 text-amber-700",
  },
  {
    value: "At risk",
    label: "At risk",
    helper: "Needs attention",
    icon: "las la-exclamation-triangle",
    toneClass: "bg-red-100 text-red-700",
  },
  {
    value: "On hold",
    label: "On hold",
    helper: "Paused temporarily",
    icon: "las la-pause-circle",
    toneClass: "bg-gray-100 text-gray-700",
  },
  {
    value: "Completed",
    label: "Completed",
    helper: "Handover done",
    icon: "las la-check-circle",
    toneClass: "bg-emerald-100 text-emerald-700",
  },
  {
    value: "Cancelled",
    label: "Cancelled",
    helper: "Stopped permanently",
    icon: "las la-times-circle",
    toneClass: "bg-zinc-100 text-zinc-700",
  },
];

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatForNextMilestone(title: string, dateTimeLocal: string) {
  if (!title.trim() && !dateTimeLocal) return "";
  const datePart = dateTimeLocal ? dateTimeLocal.replace("T", " ") : "";
  return `${title.trim() || "Milestone"}${datePart ? ` — ${datePart}` : ""}`;
}

export function EditBuildingForm({
  id,
  defaultName,
  defaultLocation,
  defaultUnits,
  defaultStatus,
  defaultProgress,
  defaultNextMilestone,
  defaultBlocks,
  defaultFloors,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<BuildingStatus>(defaultStatus);
  const [progress, setProgress] = useState<number>(defaultProgress);
  const [nextMilestone, setNextMilestone] = useState<string>(defaultNextMilestone);
  const [units, setUnits] = useState<number>(defaultUnits);
  const [floors, setFloors] = useState<number>(defaultFloors);
  const [blocks, setBlocks] = useState<string[]>(defaultBlocks.length ? defaultBlocks : ["Block A"]);
  const [newBlockName, setNewBlockName] = useState("");
  const [plannedMilestones, setPlannedMilestones] = useState<PlannedMilestone[]>([]);
  const [nextMilestoneId, setNextMilestoneId] = useState<string | null>(null);

  function addBlock() {
    const name =
      newBlockName.trim() || `Block ${String.fromCharCode(65 + blocks.length)}`;
    if (!blocks.includes(name)) {
      setBlocks((prev) => [...prev, name]);
      setNewBlockName("");
    }
  }

  function removeBlock(index: number) {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  }

  function updateBlock(index: number, value: string) {
    setBlocks((prev) => prev.map((b, i) => (i === index ? value : b)));
  }

  useEffect(() => {
    const override = readBuildingOverride(id);
    if (!override) return;
    if (override.status) setStatus(override.status);
    if (typeof override.progress === "number") setProgress(override.progress);
    if (typeof override.nextMilestone === "string") setNextMilestone(override.nextMilestone);
    if (Array.isArray(override.plannedMilestones)) setPlannedMilestones(override.plannedMilestones);
    if (typeof override.nextMilestoneId === "string" || override.nextMilestoneId === null) {
      setNextMilestoneId(override.nextMilestoneId ?? null);
    }
    if (Array.isArray(override.blocks)) setBlocks(override.blocks.length ? override.blocks : ["Block A"]);
    if (typeof override.floors === "number") setFloors(override.floors);
    if (typeof override.units === "number") setUnits(override.units);
  }, [id]);

  useEffect(() => {
    if (plannedMilestones.length === 0) return;
    if (nextMilestoneId) return;
    const shouldAutofill =
      nextMilestone.trim() === "" || nextMilestone === defaultNextMilestone;
    if (!shouldAutofill) return;
    const first = plannedMilestones[0];
    setNextMilestoneId(first.id);
    setNextMilestone(formatForNextMilestone(first.title, first.dateTimeLocal));
  }, [plannedMilestones, nextMilestoneId, nextMilestone, defaultNextMilestone]);

  const sortedPlanned = useMemo(() => plannedMilestones, [plannedMilestones]);

  return (
    <form
      className="space-y-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
      onSubmit={(e) => {
        e.preventDefault();
        writeBuildingOverride(id, {
          status,
          progress,
          nextMilestone,
          plannedMilestones,
          nextMilestoneId,
          blocks,
          floors,
          units,
        });
        router.push(`/dashboard/staff/buildings/${id}`);
      }}
    >
      <input type="hidden" name="id" value={id} />
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
          Building / project name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={defaultName}
          placeholder="e.g. Avala Resort"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none transition-colors"
        />
      </div>
      <div>
        <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-1">
          Location
        </label>
        <input
          id="location"
          name="location"
          type="text"
          defaultValue={defaultLocation}
          placeholder="e.g. Adriatic Coast, Montenegro"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none transition-colors"
        />
      </div>
      <div>
        <label htmlFor="units" className="block text-sm font-semibold text-gray-700 mb-1">
          Number of units
        </label>
        <input
          id="units"
          name="units"
          type="number"
          min={1}
          value={units}
          onChange={(e) => setUnits(Number(e.target.value))}
          placeholder="e.g. 24"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none transition-colors"
        />
      </div>

      <hr className="border-gray-200" />

      <div>
        <span className="block text-sm font-semibold text-gray-700 mb-1">Block names</span>
        <p className="text-xs text-gray-500 mb-3">
          Define the blocks or towers in this project (e.g. Block A, Tower East). These will be used when assigning investors to a unit.
        </p>
        <ul className="space-y-2 mb-3">
          {blocks.map((block, index) => (
            <li key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={block}
                onChange={(e) => updateBlock(index, e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none transition-colors"
                placeholder="e.g. Block A"
              />
              <button
                type="button"
                onClick={() => removeBlock(index)}
                disabled={blocks.length <= 1}
                className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                aria-label="Remove block"
              >
                <i className="las la-times text-lg" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <input
            type="text"
            value={newBlockName}
            onChange={(e) => setNewBlockName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addBlock())}
            placeholder="New block name"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none transition-colors"
          />
          <button
            type="button"
            onClick={addBlock}
            className="shrink-0 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Add block
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="floors" className="block text-sm font-semibold text-gray-700 mb-1">
            Number of floors
          </label>
          <input
            id="floors"
            name="floors"
            type="number"
            min={1}
            max={99}
            value={floors}
            onChange={(e) => setFloors(Number(e.target.value))}
            placeholder="e.g. 8"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none transition-colors"
          />
        </div>
        <div>
          <label htmlFor="unitsGrid" className="block text-sm font-semibold text-gray-700 mb-1">
            Number of units
          </label>
          <input
            id="unitsGrid"
            type="number"
            min={1}
            value={units}
            onChange={(e) => setUnits(Number(e.target.value))}
            placeholder="e.g. 24"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none transition-colors"
          />
        </div>
      </div>
      <div>
        <span className="block text-sm font-semibold text-gray-700 mb-3">Status</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatus(opt.value)}
              className={`relative flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                status === opt.value
                  ? "border-[#134e4a] bg-[#134e4a]/5 shadow-sm shadow-[#134e4a]/10"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
              }`}
            >
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${opt.toneClass}`}>
                <i className={`${opt.icon} text-xl`} aria-hidden />
              </span>
              <div className="min-w-0">
                <span className="block text-sm font-semibold text-gray-900">{opt.label}</span>
                <span className="block text-xs text-gray-500 mt-0.5">{opt.helper}</span>
              </div>
              {status === opt.value && (
                <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-[#134e4a]">
                  <i className="las la-check text-xs text-white" aria-hidden />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="progress" className="block text-sm font-semibold text-gray-700 mb-1">
          Progress (%)
        </label>
        <input
          id="progress"
          name="progress"
          type="number"
          min={0}
          max={100}
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none transition-colors"
        />
      </div>

      <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50/40">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Milestone plan</p>
            <p className="text-xs text-gray-500 mt-1">Add upcoming milestones and select which one is next.</p>
          </div>
          <button
            type="button"
            onClick={() =>
              setPlannedMilestones((prev) => [
                ...prev,
                { id: newId(), title: "", dateTimeLocal: "" },
              ])
            }
            className="shrink-0 px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            <i className="las la-plus text-base" aria-hidden /> Add milestone
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {sortedPlanned.length === 0 ? (
            <div className="rounded-xl bg-white border border-gray-200 p-4 text-sm text-gray-500">
              No planned milestones yet. Add a few to build your timeline.
            </div>
          ) : (
            sortedPlanned.map((m, idx) => {
              const isNext = nextMilestoneId ? nextMilestoneId === m.id : idx === 0;
              return (
                <div key={m.id} className="rounded-xl bg-white border border-gray-200 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setNextMilestoneId(m.id);
                        setNextMilestone(formatForNextMilestone(m.title, m.dateTimeLocal));
                      }}
                      className={`shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                        isNext
                          ? "border-[#134e4a] bg-[#134e4a]/5 text-[#134e4a]"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                      aria-label="Set as next milestone"
                    >
                      <i className="las la-flag text-sm" aria-hidden />
                      Next
                    </button>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Title</label>
                        <input
                          type="text"
                          value={m.title}
                          onChange={(e) => {
                            const value = e.target.value;
                            setPlannedMilestones((prev) =>
                              prev.map((x) => (x.id === m.id ? { ...x, title: value } : x))
                            );
                            if (nextMilestoneId === m.id) {
                              setNextMilestone(formatForNextMilestone(value, m.dateTimeLocal));
                            }
                          }}
                          placeholder="e.g. Final exterior painting"
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none transition-colors text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Target date & time</label>
                        <input
                          type="datetime-local"
                          value={m.dateTimeLocal}
                          onChange={(e) => {
                            const value = e.target.value;
                            setPlannedMilestones((prev) =>
                              prev.map((x) => (x.id === m.id ? { ...x, dateTimeLocal: value } : x))
                            );
                            if (nextMilestoneId === m.id) {
                              setNextMilestone(formatForNextMilestone(m.title, value));
                            }
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none transition-colors text-sm"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPlannedMilestones((prev) => prev.filter((x) => x.id !== m.id));
                        if (nextMilestoneId === m.id) {
                          setNextMilestoneId(null);
                          setNextMilestone(defaultNextMilestone);
                        }
                      }}
                      className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      aria-label="Remove milestone"
                    >
                      <i className="las la-times text-lg" aria-hidden />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div>
        <label htmlFor="nextMilestone" className="block text-sm font-semibold text-gray-700 mb-1">
          Next milestone
        </label>
        <input
          id="nextMilestone"
          name="nextMilestone"
          type="text"
          value={nextMilestone}
          onChange={(e) => setNextMilestone(e.target.value)}
          placeholder="e.g. Final exterior painting – Oct 15, 2024"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none transition-colors"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-[#134e4a] text-white font-semibold hover:bg-[#115e59] transition-colors"
        >
          Save changes
        </button>
        <Link
          href={`/dashboard/staff/buildings/${id}`}
          className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
