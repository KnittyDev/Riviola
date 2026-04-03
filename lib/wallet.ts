import type { SupabaseClient } from "@supabase/supabase-js";

export type WithdrawalRequest = {
  id: string;
  company_id: string;
  profile_id: string | null;
  amount: number;
  status: "Pending" | "Approved" | "Rejected";
  iban: string;
  bank_name: string | null;
  account_holder_name: string | null;
  currency: string;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export async function getCompanyBalance(supabase: SupabaseClient, companyId: string) {
  const { data, error } = await supabase
    .from("companies")
    .select("balance, iban, country, bank_name, currency, bank_account_holder")
    .eq("id", companyId)
    .single();

  if (error) {
    console.error("[wallet] getCompanyBalance error:", error.message);
    return null;
  }
  return data;
}

export async function getWithdrawalRequests(supabase: SupabaseClient, companyId: string): Promise<WithdrawalRequest[]> {
  const { data, error } = await supabase
    .from("withdrawal_requests")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[wallet] getWithdrawalRequests error:", error.message);
    return [];
  }
  return data || [];
}

export async function createWithdrawalRequest(
  supabase: SupabaseClient,
  companyId: string,
  profileId: string,
  amount: number,
  iban: string,
  bankName: string,
  currency: string,
  note?: string
) {
  // 1. Check balance and get bank account holder name
  const balanceData = await getCompanyBalance(supabase, companyId);
  if (!balanceData || balanceData.balance < amount) {
    return { error: "Insufficient balance" };
  }

  // 2. Insert request using the company's bank_account_holder
  const { data, error } = await supabase
    .from("withdrawal_requests")
    .insert({
      company_id: companyId,
      profile_id: profileId,
      amount,
      iban,
      bank_name: bankName,
      currency,
      account_holder_name: balanceData.bank_account_holder, // Automated from company profiles
      note,
      status: "Pending"
    })
    .select()
    .single();

  if (error) {
    console.error("[wallet] createWithdrawalRequest error:", error.message);
    return { error: error.message };
  }

  // 3. Deduct balance
  const { error: updateError } = await supabase
    .from("companies")
    .update({ balance: balanceData.balance - amount })
    .eq("id", companyId);
    
  if (updateError) {
    await supabase.from("withdrawal_requests").delete().eq("id", data.id);
    return { error: updateError.message };
  }

  return { ok: true };
}

export async function updateWithdrawalStatus(
  supabase: SupabaseClient,
  requestId: string,
  newStatus: "Approved" | "Rejected"
) {
  // 1. Get original request
  const { data: request, error: fetchError } = await supabase
    .from("withdrawal_requests")
    .select("*, companies(balance)")
    .eq("id", requestId)
    .single();

  if (fetchError || !request) {
    return { error: fetchError?.message || "Request not found" };
  }

  // 2. If already processed, return
  if (request.status !== "Pending") {
    return { error: "Request already processed" };
  }

  // 3. If rejected, refund the company balance
  if (newStatus === "Rejected") {
    const currentBalance = Number(request.companies.balance);
    const refundAmount = Number(request.amount);
    
    const { error: refundError } = await supabase
      .from("companies")
      .update({ balance: currentBalance + refundAmount })
      .eq("id", request.company_id);

    if (refundError) {
      return { error: refundError.message };
    }
  }

  // 4. Update the request status
  const { error: updateError } = await supabase
    .from("withdrawal_requests")
    .update({ status: newStatus })
    .eq("id", requestId);

  if (updateError) {
    return { error: updateError.message };
  }

  return { ok: true };
}
