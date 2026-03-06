import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getInvestorDuesFees } from "@/lib/investorDues";
import { FeesPageClient } from "./FeesPageClient";

export const dynamic = "force-dynamic";

export default async function FeesPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) redirect("/login");

  const fees = await getInvestorDuesFees(supabase, session.user.id);

  return <FeesPageClient fees={fees} />;
}
