import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStaffRequests } from "@/lib/investorRequests";
import { StaffRequestsClient } from "./StaffRequestsClient";

export const dynamic = "force-dynamic";

export default async function StaffRequestsPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, company_id")
    .eq("id", session.user.id)
    .single();

  const role = profile?.role ?? "investor";
  if (role !== "staff" && role !== "admin") redirect("/dashboard");
  const companyId = profile?.company_id;
  if (!companyId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-gray-500">No company assigned. You cannot view requests.</p>
      </div>
    );
  }

  const initialRequests = await getStaffRequests(supabase, companyId);

  return <StaffRequestsClient initialRequests={initialRequests} />;
}
