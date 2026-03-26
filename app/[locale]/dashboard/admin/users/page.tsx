import { createClient } from "@/lib/supabase/server";
import { UsersClient } from "./UsersClient";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  // Fetch all users with their staff company and investor property companies
  const { data: users } = await supabase
    .from("profiles")
    .select(`
       *,
       companies ( name ),
       investor_properties (
         buildings (
           companies ( name )
         )
       )
    `)
    .order("created_at", { ascending: false });

  return <UsersClient initialUsers={(users as any) || []} />;
}
