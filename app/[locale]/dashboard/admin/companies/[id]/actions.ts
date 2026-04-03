"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateCompanyFinancials(
  companyId: string, 
  data: { 
    currency: string, 
    bankAccountHolder: string, 
    iban: string, 
    bankName: string,
    selectedStaffIds: string[] 
  }
) {
  const supabase = await createClient();

  // 1. Update company details
  const { error: companyError } = await supabase
    .from("companies")
    .update({
      currency: data.currency,
      bank_account_holder: data.bankAccountHolder,
      iban: data.iban,
      bank_name: data.bankName
    })
    .eq("id", companyId);

  if (companyError) {
    return { error: companyError.message };
  }

  // 2. Clear old staff assignments for this company (set to 'investor' and NULL company_id)
  const { error: clearError } = await supabase
    .from("profiles")
    .update({ 
      company_id: null,
      role: 'investor' // Revert to investor if no longer in a company
    })
    .eq("company_id", companyId);

  if (clearError) {
    console.error("Error clearing/reverting old staff assignments:", clearError.message);
  }

  // 3. Assign new staff members and elevate their role
  if (data.selectedStaffIds.length > 0) {
    const { error: staffError } = await supabase
      .from("profiles")
      .update({ 
        company_id: companyId,
        role: 'staff' // Promote to staff
      })
      .in("id", data.selectedStaffIds);

    if (staffError) {
      return { error: staffError.message };
    }
  }

  revalidatePath("/dashboard/admin/companies/[id]", "page");
  revalidatePath("/dashboard/admin/companies", "page");
  return { success: true };
}
