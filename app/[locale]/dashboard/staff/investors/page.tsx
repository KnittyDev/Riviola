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
      .select("id, name, blocks, units")
      .eq("company_id", companyId)
  ]);

  const buildings = (buildingsRows ?? []).map(b => ({
    id: b.id,
    name: b.name,
    blocks: Array.isArray(b.blocks) ? b.blocks : [],
    total_units: b.units || 0
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {t("title")}
            </h1>
            <p className="text-sm text-gray-500 font-medium font-inter">{t("subtitle")}</p>
         </div>
        <Link
          href="/dashboard/staff/investors/new"
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#134e4a] text-white text-sm font-bold hover:bg-[#115e59] transition-all shadow-lg shadow-[#134e4a]/10 active:scale-95 shrink-0"
        >
          <i className="las la-user-plus text-lg" aria-hidden />
          {t("createAccount")}
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-black/5 p-12 text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="size-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i className="las la-users text-4xl text-gray-300" aria-hidden />
          </div>
          <p className="text-xl font-black text-gray-900 mb-2">{t("noProperties")}</p>
          <p className="text-sm text-gray-400 font-medium max-w-sm mx-auto mb-8">
            {t("noPropertiesSubtitle")}
          </p>
          <Link
            href="/dashboard/staff/investors/new"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#134e4a] text-white text-sm font-bold hover:bg-[#115e59] transition-all shadow-lg shadow-[#134e4a]/10"
          >
            <i className="las la-plus" aria-hidden />
            {t("createFirstInvestor")}
          </Link>
        </div>
      ) : (
        <InvestorsTable rows={properties} buildings={buildings} />
      )}
    </div>
  );
}
