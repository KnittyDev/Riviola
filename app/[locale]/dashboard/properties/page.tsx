import { redirect } from "next/navigation";
import { createClient, createClientWithToken } from "@/lib/supabase/server";
import { getInvestorPropertiesWithBuilding } from "@/lib/investorProperties";
import { getInvestorDuesFees } from "@/lib/investorDues";
import { PropertiesSummaryBar } from "@/components/dashboard/properties/PropertiesSummaryBar";
import { PropertiesPageClient } from "./PropertiesPageClient";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function PropertiesPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations("PropertiesPage");
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

  const investorType = (profile?.investor_type ?? "buyer") as "buyer" | "renter";

  const tokenClient = createClientWithToken(session.access_token);
  const [investorProperties, duesFees] = await Promise.all([
    getInvestorPropertiesWithBuilding(tokenClient, user.id),
    getInvestorDuesFees(tokenClient, user.id),
  ]);

  let totalValueLabel = t("summary.totalValue");
  let totalValueDisplay = "—";
  if (investorType === "buyer") {
    const byCurrency: Record<string, number> = {};
    for (const p of investorProperties) {
      if (p.purchase_value != null && p.purchase_value >= 0 && p.purchase_currency) {
        const c = p.purchase_currency.trim() || "EUR";
        byCurrency[c] = (byCurrency[c] ?? 0) + p.purchase_value;
      }
    }
    const sym: Record<string, string> = { EUR: "€", USD: "$", GBP: "£", TRY: "₺" };
    totalValueDisplay =
      Object.entries(byCurrency).length === 0
        ? "—"
        : Object.entries(byCurrency)
          .map(([c, v]) => `${new Intl.NumberFormat("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)} ${sym[c] ?? c}`)
          .join(" · ");
  } else {
    totalValueLabel = t("summary.totalPaid");
    const byCurrency: Record<string, number> = {};
    for (const f of duesFees) {
      if (f.status === "paid" && f.paid_at && f.amountCents != null) {
        const c = f.currency ?? "EUR";
        byCurrency[c] = (byCurrency[c] ?? 0) + f.amountCents / 100;
      }
    }
    const sym: Record<string, string> = { EUR: "€", USD: "$", GBP: "£", TRY: "₺" };
    totalValueDisplay =
      Object.entries(byCurrency).length === 0
        ? "—"
        : Object.entries(byCurrency)
          .map(([c, v]) => `${new Intl.NumberFormat("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)} ${sym[c] ?? c}`)
          .join(" · ");
  }

  const underConstructionCount = investorProperties.filter(
    (p) => p.building.status !== "Completed" && p.building.status !== "Cancelled"
  ).length;
  const completedCount = investorProperties.filter(
    (p) => p.building.status === "Completed"
  ).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 animate-fade-in">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
          {t("title")}
        </h2>
        <p className="text-gray-500 mt-1">
          {investorType === "buyer"
            ? t("subtitleBuyer")
            : t("subtitleRenter")}
        </p>
      </div>

      <PropertiesSummaryBar
        totalCount={investorProperties.length}
        underConstructionCount={underConstructionCount}
        completedCount={completedCount}
        investorType={investorType}
        totalValueLabel={totalValueLabel}
        totalValueDisplay={totalValueDisplay}
      />

      <PropertiesPageClient investorProperties={investorProperties} />
    </div>
  );
}
