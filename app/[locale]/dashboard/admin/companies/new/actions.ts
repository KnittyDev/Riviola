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
  selectedStaffIds: string[];
}) {
  const supabase = await createClient();

  // 1. Insert company
  const { data: newCompany, error } = await supabase
    .from("companies")
    .insert({
      name: data.name,
      country: data.country,
      currency: data.currency,
      bank_account_holder: data.bankAccountHolder,
      iban: data.iban,
      bank_name: data.bankName,
      balance: 0
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // 2. Assign staff members and promote them to 'staff' role
  if (data.selectedStaffIds.length > 0) {
     const { error: staffError } = await supabase
       .from("profiles")
       .update({ 
         company_id: newCompany.id,
         role: 'staff' // Promote to staff during registration
       })
       .in("id", data.selectedStaffIds);

     if (staffError) {
        console.error("Error assigning/promoting staff during registration:", staffError.message);
     }
  }

  revalidatePath("/dashboard/admin/companies", "page");
  return { success: true, companyId: newCompany.id };
}
