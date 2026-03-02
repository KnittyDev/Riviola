export type BuildingStatus =
  | "Planned"
  | "In progress"
  | "At risk"
  | "On hold"
  | "Completed"
  | "Cancelled";

export type PlannedMilestone = {
  id: string;
  title: string;
  /** ISO-ish local datetime string compatible with input[type=datetime-local] (e.g. 2026-03-02T14:30) */
  dateTimeLocal: string;
};

export type StaffBuildingOverride = {
  status?: BuildingStatus;
  progress?: number;
  nextMilestone?: string;
  plannedMilestones?: PlannedMilestone[];
  nextMilestoneId?: string | null;
  blocks?: string[];
  floors?: number;
  units?: number;
};

const STORAGE_KEY = "riviola.staff_building_overrides.v1";

function safeParseJson<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function readBuildingOverrides(): Record<string, StaffBuildingOverride> {
  if (typeof window === "undefined") return {};
  const parsed = safeParseJson<Record<string, StaffBuildingOverride>>(
    window.localStorage.getItem(STORAGE_KEY)
  );
  return parsed ?? {};
}

export function readBuildingOverride(buildingId: string): StaffBuildingOverride | null {
  const all = readBuildingOverrides();
  return all[buildingId] ?? null;
}

export function writeBuildingOverride(buildingId: string, override: StaffBuildingOverride) {
  if (typeof window === "undefined") return;
  const all = readBuildingOverrides();
  const next: Record<string, StaffBuildingOverride> = {
    ...all,
    [buildingId]: {
      ...all[buildingId],
      ...override,
    },
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

