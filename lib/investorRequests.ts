import type { SupabaseClient } from "@supabase/supabase-js";
import type { RequestType, RequestStatus } from "@/lib/staffRequestsData";

/** UI-shaped request for investor list (building name from join). */
export type InvestorRequestView = {
  id: string;
  type: RequestType;
  status: RequestStatus;
  buildingId: string;
  buildingName: string;
  requestedAt: string;
  note?: string;
  imageUrls?: string[];
};

/** Unit info for staff request detail (investor's unit in the request building). */
export type StaffRequestUnit = {
  block: string;
  unit: string;
  area_m2: number | null;
  delivery_period: string | null;
};

/** UI-shaped request for staff list (includes investor name and their units in that building). */
export type StaffRequestView = InvestorRequestView & {
  investorName: string;
  investorPhone?: string;
  investorUnits: StaffRequestUnit[];
};

/**
 * Fetches requests for the given investor (profile_id).
 * Use createClientWithToken(session.access_token) so RLS sees auth.uid().
 */
export async function getInvestorRequests(
  supabase: SupabaseClient,
  profileId: string
): Promise<InvestorRequestView[]> {
  const { data: rows, error } = await supabase
    .from("investor_requests")
    .select("id, type, status, building_id, note, image_urls, created_at, buildings(name)")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[investorRequests] getInvestorRequests error:", error.message);
    return [];
  }

  return (rows ?? []).map((r: { id: string; type: string; status: string; building_id: string; note: string | null; image_urls: string[] | null; created_at: string; buildings: any }) => {
    const bName = Array.isArray(r.buildings) ? r.buildings[0]?.name : r.buildings?.name;
    return {
      id: r.id,
      type: r.type as RequestType,
      status: r.status as RequestStatus,
      buildingId: r.building_id,
      buildingName: bName ?? "",
      requestedAt: r.created_at,
      note: r.note ?? undefined,
      imageUrls: r.image_urls ?? [],
    };
  });
}

/**
 * Inserts a new request. RLS allows only if profile_id = auth.uid() and building in investor_properties.
 */
export async function createInvestorRequest(
  supabase: SupabaseClient,
  params: { profileId: string; buildingId: string; type: string; note?: string; imageUrls?: string[] }
): Promise<{ id: string } | null> {
  const { data, error } = await supabase
    .from("investor_requests")
    .insert({
      profile_id: params.profileId,
      building_id: params.buildingId,
      type: params.type,
      status: "Pending",
      note: params.note?.trim() || null,
      image_urls: params.imageUrls ?? [],
    })
    .select("id")
    .single();

  if (error) {
    console.error("[investorRequests] createInvestorRequest error:", error.message);
    return null;
  }
  return data as { id: string };
}

const CANCELLED_BY_INVESTOR_NOTE = "Investor tarafından iptal edildi.";

/**
 * Cancels an investor's own request (sets status to Cancelled and appends cancellation note).
 * RLS allows only when profile_id = auth.uid().
 */
export async function cancelInvestorRequest(
  supabase: SupabaseClient,
  requestId: string
): Promise<boolean> {
  const { data: row } = await supabase
    .from("investor_requests")
    .select("note")
    .eq("id", requestId)
    .single();

  const existingNote = (row as { note: string | null } | null)?.note?.trim() ?? "";
  const newNote = existingNote
    ? `${existingNote}\n\n${CANCELLED_BY_INVESTOR_NOTE}`
    : CANCELLED_BY_INVESTOR_NOTE;

  const { error } = await supabase
    .from("investor_requests")
    .update({ status: "Cancelled", note: newNote })
    .eq("id", requestId);

  if (error) {
    console.error("[investorRequests] cancelInvestorRequest error:", error.message);
    return false;
  }
  return true;
}

/**
 * Fetches requests for staff's company (buildings where company_id = companyId).
 * Joins buildings(name); fetches profile full_name separately for display.
 */
export async function getStaffRequests(
  supabase: SupabaseClient,
  companyId: string
): Promise<StaffRequestView[]> {
  const { data: buildingIds } = await supabase
    .from("buildings")
    .select("id")
    .eq("company_id", companyId);

  if (!buildingIds?.length) return [];

  const ids = buildingIds.map((b) => b.id);

  const { data: rows, error } = await supabase
    .from("investor_requests")
    .select("id, type, status, building_id, note, image_urls, created_at, profile_id, buildings(name)")
    .in("building_id", ids)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[investorRequests] getStaffRequests error:", error.message);
    return [];
  }

  const profileIds = [...new Set((rows ?? []).map((r: { profile_id: string }) => r.profile_id))];
  const profileMap = new Map<string, { fullName: string; phone: string | null }>();
  if (profileIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, phone")
      .in("id", profileIds);
    (profiles ?? []).forEach((p: { id: string; full_name: string | null; phone: string | null }) => {
      profileMap.set(p.id, {
        fullName: p.full_name?.trim() ?? "Investor",
        phone: p.phone?.trim() || null,
      });
    });
  }

  const { data: unitRows } = await supabase
    .from("investor_properties")
    .select("profile_id, building_id, block, unit, area_m2, delivery_period")
    .in("building_id", ids);

  const unitMap = new Map<string, StaffRequestUnit[]>();
  (unitRows ?? []).forEach((u: { profile_id: string; building_id: string; block: string; unit: string; area_m2: number | null; delivery_period: string | null }) => {
    const key = `${u.profile_id}:${u.building_id}`;
    if (!unitMap.has(key)) unitMap.set(key, []);
    unitMap.get(key)!.push({
      block: u.block,
      unit: u.unit,
      area_m2: u.area_m2 != null ? Number(u.area_m2) : null,
      delivery_period: u.delivery_period ?? null,
    });
  });

  return (rows ?? []).map((r: {
    id: string;
    type: string;
    status: string;
    building_id: string;
    note: string | null;
    image_urls: string[] | null;
    created_at: string;
    profile_id: string;
    buildings: any;
  }) => {
    const bName = Array.isArray(r.buildings) ? r.buildings[0]?.name : r.buildings?.name;
    const profile = profileMap.get(r.profile_id);
    return {
      id: r.id,
      type: r.type as RequestType,
      status: r.status as RequestStatus,
      buildingId: r.building_id,
      buildingName: bName ?? "",
      investorName: profile?.fullName ?? "Investor",
      investorPhone: profile?.phone ?? undefined,
      requestedAt: r.created_at,
      note: r.note ?? undefined,
      imageUrls: r.image_urls ?? [],
      investorUnits: unitMap.get(`${r.profile_id}:${r.building_id}`) ?? [],
    };
  });
}

/**
 * Updates request status. RLS allows only for staff's company buildings.
 */
export async function updateRequestStatus(
  supabase: SupabaseClient,
  requestId: string,
  status: RequestStatus
): Promise<boolean> {
  const { error } = await supabase
    .from("investor_requests")
    .update({ status })
    .eq("id", requestId);

  if (error) {
    console.error("[investorRequests] updateRequestStatus error:", error.message);
    return false;
  }

  // If status is marked as "Done", trigger notifications
  if (status === "Done") {
    console.log(`[investorRequests] Status is "Done" for request ${requestId}. Triggering notifications...`);
    // We import dynamically to avoid circular dependencies if any, 
    // and because it's a side effect.
    import("@/lib/notifications").then(({ notifyRequestCompleted }) => {
      console.log(`[investorRequests] Notification module loaded. Calling notifyRequestCompleted...`);
      notifyRequestCompleted(requestId).catch(err => {
        console.error("[investorRequests] Notification trigger failed:", err);
      });
    }).catch(err => {
      console.error("[investorRequests] Failed to import notifications module:", err);
    });
  }

  return true;
}
