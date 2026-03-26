import { createClient } from "@/lib/supabase/server";
import { WithdrawalsClient } from "./WithdrawalsClient";

export default async function WithdrawalsPage() {
  const supabase = await createClient();

  // Fetch all withdrawal requests, joined with companies and requester names
  const { data: requests } = await supabase
    .from("withdrawal_requests")
    .select(`
      *,
      companies ( name, bank_name ),
      profiles ( full_name, currency )
    `)
    .order("created_at", { ascending: false });

  return <WithdrawalsClient initialRequests={(requests as any) || []} />;
}
