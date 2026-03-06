export const REQUEST_TYPES = [
  "Site tour",
  "Information",
  "Water connection",
  "Electricity connection",
  "Gas connection",
  "Handover inspection",
  "Document request",
] as const;

export type RequestType = (typeof REQUEST_TYPES)[number];
export type RequestStatus = "Pending" | "In progress" | "Done" | "Cancelled";

export const requestTypeIcons: Record<RequestType, string> = {
  "Site tour": "las la-map-marked-alt",
  "Information": "las la-info-circle",
  "Water connection": "las la-tint",
  "Electricity connection": "las la-bolt",
  "Gas connection": "las la-fire",
  "Handover inspection": "las la-clipboard-check",
  "Document request": "las la-file-alt",
};

export const requestTypeColors: Record<RequestType, string> = {
  "Site tour": "bg-blue-100 text-blue-700",
  "Information": "bg-violet-100 text-violet-700",
  "Water connection": "bg-cyan-100 text-cyan-700",
  "Electricity connection": "bg-amber-100 text-amber-700",
  "Gas connection": "bg-orange-100 text-orange-700",
  "Handover inspection": "bg-emerald-100 text-emerald-700",
  "Document request": "bg-gray-100 text-gray-700",
};

export interface InvestorRequest {
  id: string;
  type: RequestType;
  status: RequestStatus;
  investorName: string;
  buildingName: string;
  buildingId: string;
  requestedAt: string;
  note?: string;
}

export const staffRequests: InvestorRequest[] = [
  {
    id: "1",
    type: "Site tour",
    status: "Pending",
    investorName: "Alex Sterling",
    buildingName: "Avala Resort",
    buildingId: "1",
    requestedAt: "2024-10-28",
    note: "Would like to visit Unit 402 before end of November.",
  },
  {
    id: "2",
    type: "Water connection",
    status: "In progress",
    investorName: "Maria Chen",
    buildingName: "Skyline Plaza",
    buildingId: "2",
    requestedAt: "2024-10-25",
    note: "Penthouse B – need activation before handover.",
  },
  {
    id: "3",
    type: "Electricity connection",
    status: "Pending",
    investorName: "James Wright",
    buildingName: "Avala Resort",
    buildingId: "1",
    requestedAt: "2024-10-27",
  },
  {
    id: "4",
    type: "Information",
    status: "Done",
    investorName: "Alex Sterling",
    buildingName: "Avala Resort",
    buildingId: "1",
    requestedAt: "2024-10-20",
    note: "Requested floor plan and completion timeline.",
  },
  {
    id: "5",
    type: "Gas connection",
    status: "Pending",
    investorName: "Maria Chen",
    buildingName: "Skyline Plaza",
    buildingId: "2",
    requestedAt: "2024-10-26",
  },
  {
    id: "6",
    type: "Handover inspection",
    status: "In progress",
    investorName: "Sophie Laurent",
    buildingName: "Villa Serenity",
    buildingId: "3",
    requestedAt: "2024-10-22",
    note: "Scheduled for Nov 5.",
  },
  {
    id: "7",
    type: "Document request",
    status: "Pending",
    investorName: "James Wright",
    buildingName: "Avala Resort",
    buildingId: "1",
    requestedAt: "2024-10-29",
    note: "Certificate of occupancy and warranty docs.",
  },
];
