import { redirect } from "next/navigation";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getStaffRequests } from "@/lib/investorRequests";
import { StaffRequestsClient } from "./StaffRequestsClient";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function StaffRequestsPage() {
  const t = await getTranslations("Requests");
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
        <p className="text-gray-500">{t("noCompany")}</p>
      </div>
    );
  }

  const serviceClient = createServiceRoleClient();
  const initialRequests = await getStaffRequests(serviceClient, companyId);

  return <StaffRequestsClient initialRequests={initialRequests} />;
}
