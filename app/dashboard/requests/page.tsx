import { redirect } from "next/navigation";
import { createClient, createClientWithToken } from "@/lib/supabase/server";
import { getInvestorPropertiesWithBuilding } from "@/lib/investorProperties";
import { getInvestorRequests } from "@/lib/investorRequests";
import { InvestorRequestsClient } from "./InvestorRequestsClient";

export const dynamic = "force-dynamic";

export default async function InvestorRequestsPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  const role = profile?.role ?? "investor";
  if (role === "staff" || role === "admin") redirect("/dashboard/staff");

  const tokenClient = createClientWithToken(session.access_token);
  const [investorProperties, initialRequests] = await Promise.all([
    getInvestorPropertiesWithBuilding(tokenClient, session.user.id),
    getInvestorRequests(tokenClient, session.user.id),
  ]);

  const buildingsForDropdown = Array.from(
    new Map(
      investorProperties.map((p) => [
        p.building_id,
        {
          building_id: p.building_id,
          name: p.building.name,
          location: p.building.location,
        },
      ])
    ).values()
  );

  return (
    <InvestorRequestsClient
      initialRequests={initialRequests}
      buildingsForDropdown={buildingsForDropdown}
    />
  );
}
