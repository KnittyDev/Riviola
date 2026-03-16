import Link from "next/link";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getStaffCompanyId } from "@/lib/buildings";
import { getCompanyInvestorProperties } from "@/lib/companyInvestors";
import { redirect } from "next/navigation";
import { InvestorsTable } from "@/components/dashboard/staff/InvestorsTable";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function StaffInvestorsPage() {
  const t = await getTranslations("Investors");
  const supabase = await createClient();
  const companyId = await getStaffCompanyId(supabase);
  if (!companyId) redirect("/dashboard/staff");

  const serviceClient = createServiceRoleClient();
  const [properties, { data: buildingsRows }] = await Promise.all([
    getCompanyInvestorProperties(serviceClient, companyId),
    supabase
      .from("buildings")
      .select("id, name, blocks")
      .eq("company_id", companyId)
  ]);

  const buildings = (buildingsRows ?? []).map(b => ({
    id: b.id,
    name: b.name,
    blocks: Array.isArray(b.blocks) ? b.blocks : []
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          {t("title")}
        </h1>
        <Link
          href="/dashboard/staff/investors/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#134e4a] text-white text-sm font-semibold hover:bg-[#115e59] transition-colors shrink-0"
        >
          <i className="las la-user-plus" aria-hidden />
          {t("createAccount")}
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <i className="las la-users text-4xl text-gray-300 mb-4" aria-hidden />
          <p className="text-gray-500 font-medium">{t("noProperties")}</p>
          <p className="text-sm text-gray-400 mt-1 mb-6">
            {t("noPropertiesSubtitle")}
          </p>
          <Link
            href="/dashboard/staff/investors/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#134e4a] text-white text-sm font-semibold hover:bg-[#115e59] transition-colors"
          >
            <i className="las la-plus" aria-hidden />
            {t("createAccount")}
          </Link>
        </div>
      ) : (
        <InvestorsTable rows={properties} buildings={buildings} />
      )}
    </div>
  );
}
