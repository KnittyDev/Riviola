"use server";

import { createClient } from "@/lib/supabase/server";
import { createInvestorRequest, cancelInvestorRequest } from "@/lib/investorRequests";

export type CreateRequestResult = { id?: string; error?: string };

export async function createInvestorRequestAction(
  buildingId: string,
  type: string,
  note?: string,
  imageUrls?: string[]
): Promise<CreateRequestResult> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return { error: "Not authenticated" };

  const result = await createInvestorRequest(supabase, {
    profileId: session.user.id,
    buildingId,
    type,
    note,
    imageUrls,
  });
  if (!result) return { error: "Failed to create request" };
  return { id: result.id };
}

export type CancelRequestResult = { ok?: boolean; error?: string };

export async function cancelInvestorRequestAction(
  requestId: string
): Promise<CancelRequestResult> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return { error: "Not authenticated" };

  const ok = await cancelInvestorRequest(supabase, requestId);
  if (!ok) return { error: "Failed to cancel request" };
  return { ok: true };
}
