"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function registerNewCompany(data: {
  name: string;
  country: string;
  currency: string;
  bankAccountHolder: string;
  iban: string;
  bankName: string;
}) {
  const supabase = await createClient();

  const { data: newCompany, error } = await supabase
    .from("companies")
    .insert({
      name: data.name,
      country: data.country,
      currency: data.currency,
      bank_account_holder: data.bankAccountHolder,
      iban: data.iban,
      bank_name: data.bankName,
      balance: 0 // New companies start with zero balance
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/admin/companies", "page");
  return { success: true, companyId: newCompany.id };
}
