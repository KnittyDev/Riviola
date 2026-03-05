import { redirect } from "next/navigation";
import { createClient, createClientWithToken } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PortfolioChart } from "@/components/dashboard/PortfolioChart";
import { UpcomingMilestones } from "@/components/dashboard/UpcomingMilestones";
import { MyPropertiesSection } from "@/components/dashboard/MyPropertiesSection";
import { getInvestorPropertiesWithBuilding } from "@/lib/investorProperties";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // 1. Verify session via cookie-based client
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) redirect("/login");

  const user = session.user;

  // 2. Fetch profile role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "investor";
  if (role === "staff" || role === "admin") redirect("/dashboard/staff");

  // 3. Fetch investor properties using a client with explicit Bearer token
  //    so that RLS correctly identifies auth.uid()
  const tokenClient = createClientWithToken(session.access_token);
  const investorProperties = await getInvestorPropertiesWithBuilding(
    tokenClient,
    user.id
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <DashboardHeader />
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <PortfolioChart />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <UpcomingMilestones />
        </div>
        <MyPropertiesSection investorProperties={investorProperties} />
      </div>
    </div>
  );
}
