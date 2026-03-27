import { createClient } from "@/lib/supabase/server";
import { SupportClient } from "./SupportClient";

export default async function AdminSupportPage() {
  const supabase = await createClient();

  // Fetch all support tickets with their profiles AND replies joined with profile names
  const { data: tickets } = await supabase
    .from("support_tickets")
    .select(`
       *,
       profiles ( 
         full_name,
         email
       ),
       support_ticket_replies (
         *,
         profiles ( full_name )
       )
    `)
    .order("created_at", { ascending: false });

  return <SupportClient initialTickets={(tickets as any) || []} />;
}
