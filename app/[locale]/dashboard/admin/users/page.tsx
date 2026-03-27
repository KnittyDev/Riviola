import { createClient } from "@/lib/supabase/server";
import { UsersClient } from "./UsersClient";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  // Fetch all users with their staff company and investor property companies/buildings
  const { data: users } = await supabase
    .from("profiles")
    .select(`
       *,
       companies ( name ),
       investor_properties (
         building_id,
         buildings (
           id,
           name,
           companies ( name )
         )
       )
    `)
    .order("created_at", { ascending: false });

  // Fetch buildings list for filtering
  const { data: buildings } = await supabase
    .from("buildings")
    .select("id, name")
    .order("name");

  return (
    <UsersClient 
      initialUsers={(users as any) || []} 
      buildings={(buildings as any) || []}
    />
  );
}
