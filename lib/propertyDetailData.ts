export interface PlanItem {
  date: string;
  time: string;
  title: string;
  description: string;
  status: "completed" | "upcoming" | "in-progress";
}

export interface LogItem {
  date: string;
  time: string;
  category: string;
  message: string;
}

export interface WeeklyPhotoUpdateImage {
  url: string;
  alt: string;
}

export interface WeeklyPhotoUpdate {
  id: string;
  weekLabel: string;
  range: string;
  description: string;
  images: WeeklyPhotoUpdateImage[];
}

export interface PropertyDetail {
  id: string;
  title: string;
  location: string;
  badge: string;
  progress: number;
  imageSrc: string;
  imageAlt: string;
  value: string;
  area: string;
  deliveryDate: string;
  country?: string;
  city?: string;
  plans: PlanItem[];
  logs: LogItem[];
  weeklyUpdates?: WeeklyPhotoUpdate[];
}

const propertyDetails: Record<string, PropertyDetail> = {
  "1": {
    id: "1",
    title: "Avala Resort Unit 402",
    location: "Adriatic Coast, Montenegro",
    badge: "Premium Resort",
    progress: 82,
    imageSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBk9Lbr7bbdUJrwIE_onVKNNn1TIuch8Hu8isHVQKGSohElxsK_l1U8qWgPiuwpPv_arDY7-16T7KYY7JRRBRVe3puTXkPjGZoJ1kizacIlp67I4O1dRn45F3XxaQnw11d-qeRzy_Pq3-WRHyu7kdLuUesKEHlFYWBFf5XUXH0ohQOqWRXuKfF0tnr4lHYGVbf9pljF1oAxoJ-hsuAUiUxRQCE9XOsMneWMb327LZNJQd6koqaxH5BymFBn80oJnzl-Hrr9k0MG_ubC",
    imageAlt: "Avala Resort Unit 402",
    value: "420.000€",
    area: "148 m²",
    deliveryDate: "Dec 2024",
    country: "Montenegro",
    city: "Budva",
    plans: [
      {
        date: "2024-01-15",
        time: "09:00",
        title: "Foundation pour",
        description: "Concrete pour for basement and ground floor foundation slab.",
        status: "completed",
      },
      {
        date: "2024-02-28",
        time: "14:00",
        title: "Structural frame – Level 1",
        description: "Steel and concrete frame completion for first floor.",
        status: "completed",
      },
      {
        date: "2024-04-12",
        time: "10:30",
        title: "MEP rough-in",
        description: "Mechanical, electrical and plumbing rough-in inspection.",
        status: "completed",
      },
      {
        date: "2024-10-15",
        time: "08:00",
        title: "Final exterior painting",
        description: "Full exterior coat and touch-ups. Weather-dependent.",
        status: "in-progress",
      },
      {
        date: "2024-11-02",
        time: "09:00",
        title: "Interior fit-out phase 3",
        description: "Master suite and guest bathrooms tiling and fixtures.",
        status: "upcoming",
      },
      {
        date: "2024-12-20",
        time: "11:00",
        title: "Key handover ceremony",
        description: "Final walkthrough and key handover to client.",
        status: "upcoming",
      },
    ],
    logs: [
      { date: "2024-10-14", time: "16:32", category: "Construction", message: "Interior marble installation for master suite completed. Terrace glass balustrades ordered, ETA tomorrow 10:00." },
      { date: "2024-10-14", time: "11:15", category: "Inspection", message: "Electrical sign-off passed for zones 1–3. Minor snag list issued for zone 4." },
      { date: "2024-10-13", time: "09:00", category: "Delivery", message: "Marble shipment received (Batch #M-402-A). Stored on-site, humidity check logged." },
      { date: "2024-10-12", time: "14:00", category: "Construction", message: "Drywall finishing completed in living area. Sanding and primer scheduled for 14 Oct 08:00." },
      { date: "2024-10-11", time: "17:45", category: "Safety", message: "Weekly safety audit completed. No incidents. Scaffolding inspection passed." },
      { date: "2024-10-10", time: "10:20", category: "Design", message: "Client approval received for master bathroom tile layout. Variation V-012 closed." },
    ],
    weeklyUpdates: [
      {
        id: "w1",
        weekLabel: "Week 41",
        range: "7–13 Oct 2024",
        description: "Focus on interior finishes and terrace works.",
        images: [
          {
            url: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=900&q=80",
            alt: "Living area finishes progress",
          },
          {
            url: "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=900&q=80",
            alt: "Master bathroom tiling detail",
          },
          {
            url: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=900&q=80",
            alt: "Terrace glass balustrade installation",
          },
        ],
      },
      {
        id: "w2",
        weekLabel: "Week 40",
        range: "30 Sep – 6 Oct 2024",
        description: "Electrical and MEP checks across zones 1–3.",
        images: [
          {
            url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&q=80",
            alt: "Electrical panel inspection",
          },
          {
            url: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=900&q=80",
            alt: "MEP coordination on site",
          },
        ],
      },
    ],
  },
  "2": {
    id: "2",
    title: "Skyline Plaza Penthouse B",
    location: "Financial District, London",
    badge: "Urban Equity",
    progress: 45,
    imageSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuALHuXQlUwuZ1G9w4_7SdvkLUQPMeCUF88FD_3mNbtiRBZVcRxTJ7vQyW9iYBzsSi7PoS16HuLnky2-_v3puWUmwZVbDMveOl3bbrTGFcJEXKMFxpgGat6xtGeVwqgrzKvmEMk9FWzQSszXmLT5tz2y43MxuKMfARF0AQskOQbf2iQc03H7mgBgOO-50EYOx6QwQ-Jzas4GgUd4AI_31j13GpRl-quV9NmBm81OzzfEcJqQ1q-yPAlElt9RGxW8OxILhOUajvtRO_f1",
    imageAlt: "Skyline Plaza Penthouse B",
    value: "1.240.000€",
    area: "312 m²",
    deliveryDate: "Jun 2025",
    country: "United Kingdom",
    city: "London",
    plans: [
      { date: "2024-03-01", time: "09:00", title: "1st floor structural frame", description: "Structural framework completion and sign-off.", status: "completed" },
      { date: "2024-05-15", time: "10:00", title: "Roofing structure", description: "Weatherproofing and roofing structure.", status: "in-progress" },
      { date: "2024-08-01", time: "14:00", title: "Interior fit-out phase 1", description: "Drywall and first fix MEP.", status: "upcoming" },
      { date: "2025-02-15", time: "09:00", title: "Facade completion", description: "Full curtain wall and cladding.", status: "upcoming" },
      { date: "2025-06-01", time: "11:00", title: "Handover", description: "Key handover and snag period start.", status: "upcoming" },
    ],
    logs: [
      { date: "2024-10-14", time: "15:00", category: "Construction", message: "Structural topping out ceremony scheduled for next month. External facade framing has reached level 12." },
      { date: "2024-10-13", time: "11:22", category: "Delivery", message: "Steel delivery for levels 13–14 received. Crane slot booked 14 Oct 07:00–09:00." },
      { date: "2024-10-12", time: "09:45", category: "Inspection", message: "Fire compartmentation inspection – Level 11 passed. One re-check required Level 12." },
      { date: "2024-10-11", time: "16:00", category: "Design", message: "Revised kitchen layout (DR-044) approved. Sent to subcontractor." },
      { date: "2024-10-10", time: "08:30", category: "Construction", message: "Concrete pour Level 12 slab completed. Curing period 7 days." },
    ],
  },
  "3": {
    id: "3",
    title: "Villa Serenity No. 7",
    location: "Côte d'Azur, France",
    badge: "Luxury Villa",
    progress: 100,
    imageSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC4Uoiq59EIwZE5uBwj8YJOQ-g6jhc-n5wljauAb2drGF4dVvoRgjn3aHcu3O84IYRo7Et-mYL7PjBjIRA1MFP45PiuaIaeuB9RviZFnxFKeflP2OQJXe8rKzGYIjAto940E-Mm8risvrMzF2568q9L2eBfYRfTbCxKEL4SvbK-4QXGNJpK4EesiOHtetrRH3GFeNiiddnbr8aKRjdVplmBpQs-hssuaw2Zd_dXq1ur3n_lwIIFjbgjYTGQsPWH6cZad1Gw9sj2PkeL",
    imageAlt: "Villa Serenity No. 7",
    value: "1.180.000€",
    area: "420 m²",
    deliveryDate: "Mar 2024",
    country: "France",
    city: "Nice",
    plans: [
      { date: "2024-03-15", time: "10:00", title: "Key handover", description: "Final handover and key release.", status: "completed" },
    ],
    logs: [
      { date: "2024-03-15", time: "10:05", category: "Handover", message: "Final inspection passed. Keys handed over. Smart home system fully commissioned." },
      { date: "2024-03-14", time: "16:00", category: "Snagging", message: "Snag list cleared. All items signed off by client." },
      { date: "2024-03-10", time: "09:00", category: "Inspection", message: "Building control final certificate issued." },
    ],
  },
  "4": {
    id: "4",
    title: "Riviera Heights Tower A",
    location: "Barcelona, Spain",
    badge: "Mixed Use",
    progress: 0,
    imageSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBk9Lbr7bbdUJrwIE_onVKNNn1TIuch8Hu8isHVQKGSohElxsK_l1U8qWgPiuwpPv_arDY7-16T7KYY7JRRBRVe3puTXkPjGZoJ1kizacIlp67I4O1dRn45F3XxaQnw11d-qeRzy_Pq3-WRHyu7kdLuUesKEHlFYWBFf5XUXH0ohQOqWRXuKfF0tnr4lHYGVbf9pljF1oAxoJ-hsuAUiUxRQCE9XOsMneWMb327LZNJQd6koqaxH5BymFBn80oJnzl-Hrr9k0MG_ubC",
    imageAlt: "Riviera Heights Tower A",
    value: "890.000€",
    area: "265 m²",
    deliveryDate: "Q3 2026",
    country: "Spain",
    city: "Barcelona",
    plans: [
      { date: "2025-01-15", time: "09:00", title: "Site mobilisation", description: "Fencing, site setup and groundworks start.", status: "upcoming" },
      { date: "2025-06-01", time: "10:00", title: "Foundation works", description: "Piling and foundation slab.", status: "upcoming" },
      { date: "2026-09-01", time: "11:00", title: "Estimated handover", description: "Target key handover subject to permits.", status: "upcoming" },
    ],
    logs: [
      { date: "2024-10-12", time: "14:30", category: "Planning", message: "Architectural drawings finalized. Environmental impact assessment pending local authority approval." },
      { date: "2024-10-01", time: "11:00", category: "Permit", message: "Planning application submitted. Reference PA-2024-8872." },
      { date: "2024-09-20", time: "09:00", category: "Design", message: "Client sign-off on unit mix and floor plans. Sent to structural engineer." },
    ],
  },
};

export function getPropertyDetail(id: string): PropertyDetail | null {
  return propertyDetails[id] ?? null;
}
