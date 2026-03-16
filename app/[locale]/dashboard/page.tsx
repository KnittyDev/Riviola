import { redirect } from "next/navigation";
import { createClient, createClientWithToken } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PortfolioChart } from "@/components/dashboard/PortfolioChart";
import { UpcomingMilestones } from "@/components/dashboard/UpcomingMilestones";
import { MyPropertiesSection } from "@/components/dashboard/MyPropertiesSection";
import { getInvestorPropertiesWithBuilding, getInvestorWeeklyUpdates, getInvestorUpcomingMilestones } from "@/lib/investorProperties";
import { getInvestorDuesFees } from "@/lib/investorDues";

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  TRY: "₺",
  CHF: "Fr",
  AUD: "A$",
  CAD: "C$",
  NOK: "kr",
  SEK: "kr",
  AED: "د.إ",
  SAR: "﷼",
};

function formatValueByCurrency(totalByCurrency: Record<string, number>): string {
  const entries = Object.entries(totalByCurrency).filter(([, v]) => v > 0);
  if (entries.length === 0) return "—";
  return entries
    .map(([c, v]) => {
      const sym = CURRENCY_SYMBOLS[c] ?? c + " ";
      const formatted = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
      return sym === "€" || sym === "£" || sym === "₺" ? `${formatted} ${sym}` : `${sym}${formatted}`;
    })
    .join(" · ");
}

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) redirect("/login");

  const user = session.user;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, investor_type")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "investor";
  if (role === "staff" || role === "admin") redirect("/dashboard/staff");

  const investorType = (profile?.investor_type ?? "buyer") as "renter" | "buyer";

  const tokenClient = createClientWithToken(session.access_token);
  const investorProperties = await getInvestorPropertiesWithBuilding(
    tokenClient,
    user.id
  );
  const buildingIds = [...new Set(investorProperties.map((p) => p.building_id))];
  const buildingNameById = new Map(
    investorProperties.map((p) => [p.building_id, p.building.name])
  );
  const [weeklyUpdates, upcomingMilestones, duesFees] = await Promise.all([
    getInvestorWeeklyUpdates(tokenClient, buildingIds, buildingNameById),
    getInvestorUpcomingMilestones(tokenClient, buildingIds, buildingNameById, 5),
    getInvestorDuesFees(tokenClient, user.id),
  ]);

  const assetValueByCurrency: Record<string, number> = {};
  if (investorType === "buyer") {
    for (const p of investorProperties) {
      if (p.purchase_value != null && p.purchase_value >= 0 && p.purchase_currency) {
        const c = p.purchase_currency.trim() || "EUR";
        assetValueByCurrency[c] = (assetValueByCurrency[c] ?? 0) + p.purchase_value;
      }
    }
  }

  const paidAmountByCurrency: Record<string, number> = {};
  const paidDuesChartData: { month: string; value: number }[] = [];
  if (investorType === "renter") {
    for (const f of duesFees) {
      if (f.status === "paid" && f.paid_at && f.amountCents != null) {
        const c = f.currency ?? "EUR";
        const amount = f.amountCents / 100;
        paidAmountByCurrency[c] = (paidAmountByCurrency[c] ?? 0) + amount;
      }
    }
    const byPeriod = new Map<string, number>();
    for (const f of duesFees) {
      if (f.status === "paid" && f.paid_at != null && f.amountCents != null) {
        const period = f.periodKey;
        const amount = f.amountCents / 100;
        byPeriod.set(period, (byPeriod.get(period) ?? 0) + amount);
      }
    }
    const sortedPeriods = [...byPeriod.keys()].sort();
    let cumulative = 0;
    for (const p of sortedPeriods) {
      cumulative += byPeriod.get(p) ?? 0;
      const [y, m] = p.split("-").map(Number);
      const d = new Date(y, m - 1, 1);
      const monthLabel = d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }).toUpperCase();
      paidDuesChartData.push({ month: monthLabel, value: Math.round(cumulative * 100) / 100 });
    }
  }

  const assetValueFormatted = formatValueByCurrency(assetValueByCurrency);
  const paidAmountFormatted = formatValueByCurrency(paidAmountByCurrency);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <DashboardHeader />
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <PortfolioChart
            investorType={investorType}
            assetValueFormatted={assetValueFormatted}
            paidAmountFormatted={paidAmountFormatted}
            assetValueNumber={Object.values(assetValueByCurrency).reduce((a, b) => a + b, 0)}
            paidAmountNumber={Object.values(paidAmountByCurrency).reduce((a, b) => a + b, 0)}
            paidDuesChartData={paidDuesChartData}
          />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <UpcomingMilestones milestones={upcomingMilestones} />
        </div>
        <MyPropertiesSection
          investorProperties={investorProperties}
          weeklyUpdates={weeklyUpdates}
          investorType={investorType}
          assetValueFormatted={assetValueFormatted}
          paidAmountFormatted={paidAmountFormatted}
        />
      </div>
    </div>
  );
}
