import { createClient } from "@/lib/supabase/server";
import { SupportClient } from "./SupportClient";

export default async function AdminSupportPage() {
  const supabase = await createClient();

  // Fetch all support tickets with their profiles
  const { data: tickets } = await supabase
    .from("support_tickets")
    .select(`
       *,
       profiles ( 
         full_name,
         email
       )
    `)
    .order("created_at", { ascending: false });

  return <SupportClient initialTickets={(tickets as any) || []} />;
}
