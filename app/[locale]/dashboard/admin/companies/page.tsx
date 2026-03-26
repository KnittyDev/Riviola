import { createClient } from "@/lib/supabase/server";
import { CompaniesClient } from "./CompaniesClient";

export default async function AdminCompaniesPage() {
  const supabase = await createClient();

  // Fetch all companies
  const { data: companies } = await supabase
    .from("companies")
    .select("*")
    .order("name", { ascending: true });

  return <CompaniesClient initialCompanies={(companies as any) || []} />;
}
