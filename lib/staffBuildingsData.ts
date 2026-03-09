export const staffBuildings = [
  {
    id: "1",
    name: "Avala Resort",
    location: "Adriatic Coast, Montenegro",
    progress: 82,
    status: "In progress",
    nextMilestone: "Final exterior painting – Oct 15, 2024",
    units: 24,
    imageUrl: "https://yklvleoalhkoqncahalg.supabase.co/storage/v1/object/public/building_banners/fe7cad0d-b72f-43e9-b2b3-a68a36596450.jpg",
  },
  {
    id: "2",
    name: "Skyline Plaza",
    location: "Financial District, London",
    progress: 45,
    status: "In progress",
    nextMilestone: "Roofing structure – May 15, 2024",
    units: 12,
    imageUrl: "https://yklvleoalhkoqncahalg.supabase.co/storage/v1/object/public/building_banners/fe7cad0d-b72f-43e9-b2b3-a68a36596450.jpg",
  },
  {
    id: "3",
    name: "Villa Serenity",
    location: "Côte d'Azur, France",
    progress: 100,
    status: "Completed",
    nextMilestone: "Handover done – Mar 2024",
    units: 8,
    imageUrl: "https://yklvleoalhkoqncahalg.supabase.co/storage/v1/object/public/building_banners/fe7cad0d-b72f-43e9-b2b3-a68a36596450.jpg",
  },
  {
    id: "4",
    name: "Horizon Towers",
    location: "New Belgrade, Serbia",
    progress: 15,
    status: "In progress",
    nextMilestone: "Foundation groundwork – Dec 20, 2024",
    units: 120,
    imageUrl: "https://yklvleoalhkoqncahalg.supabase.co/storage/v1/object/public/building_banners/fe7cad0d-b72f-43e9-b2b3-a68a36596450.jpg",
  },
] as const;

export function getBuildingById(id: string) {
  return staffBuildings.find((b) => b.id === id) ?? null;
}

/** Blocks per building (project block name) */
export const buildingBlocks: Record<string, string[]> = {
  "1": ["Block A", "Block B", "Block C"],
  "2": ["Tower East", "Tower West"],
  "3": ["Villa 1", "Villa 2", "Villa 3"],
};

/** Number of floors per building */
export const buildingFloors: Record<string, number> = {
  "1": 8,
  "2": 12,
  "3": 3,
};

/** Past progress milestones (written/logged for the building). dateTime: ISO string for full detail (day, date, time). */
export interface ProgressMilestoneLog {
  id: string;
  label: string;
  date: string;
  /** Optional ISO date-time for detailed display (e.g. "2024-01-15T14:30:00") */
  dateTime?: string;
}

export const buildingProgressMilestones: Record<string, ProgressMilestoneLog[]> = {
  "1": [
    { id: "1", label: "Foundation completed", date: "Jan 2024", dateTime: "2024-01-15T09:00:00" },
    { id: "2", label: "Structure complete", date: "Apr 2024", dateTime: "2024-04-08T14:30:00" },
    { id: "3", label: "Roofing structure", date: "Jun 2024", dateTime: "2024-06-12T11:15:00" },
    { id: "4", label: "MEP rough-in", date: "Aug 2024", dateTime: "2024-08-05T16:45:00" },
    { id: "5", label: "Final exterior painting", date: "Oct 2024", dateTime: "2024-10-15T10:00:00" },
  ],
  "2": [
    { id: "1", label: "Foundation completed", date: "Mar 2024", dateTime: "2024-03-01T08:30:00" },
    { id: "2", label: "Roofing structure", date: "May 2024", dateTime: "2024-05-15T13:00:00" },
  ],
  "3": [
    { id: "1", label: "Construction complete", date: "Feb 2024", dateTime: "2024-02-20T15:30:00" },
    { id: "2", label: "Handover done", date: "Mar 2024", dateTime: "2024-03-05T10:00:00" },
  ],
};

export function getBuildingMilestones(buildingId: string): ProgressMilestoneLog[] {
  return buildingProgressMilestones[buildingId] ?? [];
}
