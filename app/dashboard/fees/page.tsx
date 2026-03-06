import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getInvestorDuesFees, getCompanyForInvestorProfile } from "@/lib/investorDues";
import { FeesPageClient } from "./FeesPageClient";

export const dynamic = "force-dynamic";

export default async function FeesPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) redirect("/login");

  const [fees, company] = await Promise.all([
    getInvestorDuesFees(supabase, session.user.id),
    getCompanyForInvestorProfile(supabase, session.user.id),
  ]);

  return <FeesPageClient fees={fees} company={company} />;
}
