import {
  staffRequests,
  type InvestorRequest,
  type RequestStatus,
  type RequestType,
} from "@/lib/staffRequestsData";

const STORAGE_KEY = "riviola_requests";

function getStored(): InvestorRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as InvestorRequest[];
  } catch {
    // ignore
  }
  return [];
}

function seedIfEmpty(): InvestorRequest[] {
  const stored = getStored();
  if (stored.length > 0) return stored;
  const seed = [...staffRequests];
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    }
  } catch {
    // ignore
  }
  return seed;
}

/** Tüm talepleri döndürür (ilk çalıştırmada seed’i yükler). */
export function getAllRequests(): InvestorRequest[] {
  const stored = getStored();
  if (stored.length > 0) return stored;
  return seedIfEmpty();
}

/** Yeni talep ekler; id ve requestedAt otomatik atanır. */
export function addRequest(
  request: Omit<InvestorRequest, "id" | "requestedAt">
): InvestorRequest {
  const list = getAllRequests();
  const now = new Date().toISOString().slice(0, 10);
  const id = `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const newReq: InvestorRequest = {
    ...request,
    id,
    requestedAt: now,
  };
  const next = [...list, newReq];
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  return newReq;
}

/** Talep durumunu günceller (staff tarafında). */
export function updateRequestStatus(id: string, status: RequestStatus): void {
  const list = getAllRequests();
  const next = list.map((r) => (r.id === id ? { ...r, status } : r));
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
}

/** Belirli bir yatırımcıya ait talepleri döndürür (isim ile filtre). */
export function getRequestsByInvestor(investorName: string): InvestorRequest[] {
  return getAllRequests().filter(
    (r) => r.investorName.toLowerCase() === investorName.toLowerCase()
  );
}

// Re-export type for form
export type { RequestType };
