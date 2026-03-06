"use server";

import { createClient } from "@/lib/supabase/server";
import { updateRequestStatus as updateRequestStatusDb } from "@/lib/investorRequests";
import type { RequestStatus } from "@/lib/staffRequestsData";

export type UpdateStatusResult = { ok?: boolean; error?: string };

export async function updateRequestStatusAction(
  requestId: string,
  status: RequestStatus
): Promise<UpdateStatusResult> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return { error: "Not authenticated" };

  const ok = await updateRequestStatusDb(supabase, requestId, status);
  if (!ok) return { error: "Failed to update status" };
  return { ok: true };
}
