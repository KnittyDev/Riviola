export const staffBuildings = [
  {
    id: "1",
    name: "Avala Resort",
    location: "Adriatic Coast, Montenegro",
    progress: 82,
    status: "In progress",
    nextMilestone: "Final exterior painting – Oct 15, 2024",
    units: 24,
    imageUrl: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80",
  },
  {
    id: "2",
    name: "Skyline Plaza",
    location: "Financial District, London",
    progress: 45,
    status: "In progress",
    nextMilestone: "Roofing structure – May 15, 2024",
    units: 12,
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
  },
  {
    id: "3",
    name: "Villa Serenity",
    location: "Côte d'Azur, France",
    progress: 100,
    status: "Completed",
    nextMilestone: "Handover done – Mar 2024",
    units: 8,
    imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
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
