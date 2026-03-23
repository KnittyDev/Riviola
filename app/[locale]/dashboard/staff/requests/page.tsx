import { redirect } from "next/navigation";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getStaffRequests } from "@/lib/investorRequests";
import { StaffRequestsClient } from "./StaffRequestsClient";
import { getTranslations } from "next-intl/server";
import { getPlanLimits } from "@/lib/plan.server";
import { Link } from "@/i18n/routing";

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

  const limits = await getPlanLimits();
  if (!limits.hasRequestTracking) {
    const tLimits = await getTranslations("Limits");
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden relative">
           <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-[#134e4a] to-teal-400" />
           <div className="p-12 text-center max-w-2xl mx-auto">
              <div className="size-20 rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-8 shadow-sm shadow-amber-100">
                <i className="las la-lock text-4xl" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
                {tLimits("featureLocked")}
              </h2>
              <p className="text-gray-500 text-lg mb-10 leading-relaxed">
                {tLimits("featureLockedDesc")}
              </p>
              <Link
                href="/dashboard/staff/subscription"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#134e4a] text-white font-bold hover:bg-[#115e59] transition-all hover:scale-105 shadow-lg shadow-[#134e4a]/20"
              >
                <i className="las la-arrow-up text-xl" />
                {tLimits("upgradeNow")}
              </Link>
           </div>
        </div>
      </div>
    );
  }

  const serviceClient = createServiceRoleClient();
  const initialRequests = await getStaffRequests(serviceClient, companyId);

  return <StaffRequestsClient initialRequests={initialRequests} />;
}
