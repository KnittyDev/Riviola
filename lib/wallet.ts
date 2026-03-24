import type { SupabaseClient } from "@supabase/supabase-js";

export type WithdrawalRequest = {
  id: string;
  company_id: string;
  profile_id: string | null;
  amount: number;
  status: "Pending" | "Approved" | "Rejected";
  iban: string;
  bank_name: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export async function getCompanyBalance(supabase: SupabaseClient, companyId: string) {
  const { data, error } = await supabase
    .from("companies")
    .select("balance, iban, country, bank_name")
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
  note?: string
) {
  // 1. Check balance
  const balanceData = await getCompanyBalance(supabase, companyId);
  if (!balanceData || balanceData.balance < amount) {
    return { error: "Insufficient balance" };
  }

  // 2. Insert request
  const { data, error } = await supabase
    .from("withdrawal_requests")
    .insert({
      company_id: companyId,
      profile_id: profileId,
      amount,
      iban,
      bank_name: bankName,
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
