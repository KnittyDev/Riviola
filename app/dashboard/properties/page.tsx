import { redirect } from "next/navigation";
import { createClient, createClientWithToken } from "@/lib/supabase/server";
import { getInvestorPropertiesWithBuilding } from "@/lib/investorProperties";
import { PropertiesSummaryBar } from "@/components/dashboard/properties/PropertiesSummaryBar";
import { PropertiesPageClient } from "./PropertiesPageClient";

export const dynamic = "force-dynamic";

export default async function PropertiesPage() {
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
      <div className="mb-8 animate-fade-in">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
          My Properties
        </h2>
        <p className="text-gray-500 mt-1">
          Manage and track all your real estate assets.
        </p>
      </div>

      <PropertiesSummaryBar totalCount={investorProperties.length} />

      <PropertiesPageClient investorProperties={investorProperties} />
    </div>
  );
}
