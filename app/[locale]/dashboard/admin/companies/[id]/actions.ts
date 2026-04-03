"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateCompanyFinancials(companyId: string, data: { currency: string, bankAccountHolder: string, iban: string, bankName: string }) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("companies")
    .update({
      currency: data.currency,
      bank_account_holder: data.bankAccountHolder,
      iban: data.iban,
      bank_name: data.bankName
    })
    .eq("id", companyId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/admin/companies/[id]", "page");
  revalidatePath("/dashboard/admin/companies", "page");
  return { success: true };
}
