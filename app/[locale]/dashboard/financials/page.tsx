import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getInvestorPropertiesWithBuilding } from "@/lib/investorProperties";
import { getPurchaseInstallmentsForInvestor } from "@/lib/purchaseInstallments";
import { FinancialsProgressCard } from "@/components/dashboard/financials/FinancialsProgressCard";
import { MilestonesTable } from "@/components/dashboard/financials/MilestonesTable";

/** Total purchase value per currency (currency code -> sum). */
export type TotalByCurrency = Record<string, number>;

export default async function FinancialsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [properties, installments] = await Promise.all([
    getInvestorPropertiesWithBuilding(supabase, user.id),
    getPurchaseInstallmentsForInvestor(supabase, user.id),
  ]);

  const totalByCurrency: TotalByCurrency = {};
  for (const p of properties) {
    if (p.purchase_value != null && p.purchase_value >= 0 && p.purchase_currency) {
      const c = p.purchase_currency.trim() || "EUR";
      totalByCurrency[c] = (totalByCurrency[c] ?? 0) + p.purchase_value;
    }
  }

  const paidByCurrency: TotalByCurrency = {};
  const pendingByCurrency: TotalByCurrency = {};
  for (const i of installments) {
    if (i.amount == null) continue;
    const c = (i.currency || "EUR").trim();
    if (i.paid_at) {
      paidByCurrency[c] = (paidByCurrency[c] ?? 0) + Number(i.amount);
    } else {
      pendingByCurrency[c] = (pendingByCurrency[c] ?? 0) + Number(i.amount);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 animate-fade-in">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            Financials & Installments
          </h1>
          <p className="text-gray-500 text-base">
            Track payment milestones and outstanding balances for your
            properties.
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <i className="las la-download text-lg" aria-hidden />
          Export Report
        </button>
      </div>

      <div className="flex flex-col gap-8">
        <FinancialsProgressCard
          totalByCurrency={totalByCurrency}
          paidByCurrency={paidByCurrency}
          pendingByCurrency={pendingByCurrency}
        />
        <MilestonesTable installments={installments} />
      </div>
    </div>
  );
}
