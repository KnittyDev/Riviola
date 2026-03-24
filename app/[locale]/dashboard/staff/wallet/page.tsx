import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getCompanyBalance, getWithdrawalRequests } from "@/lib/wallet";
import WalletClient from "./WalletClient";

export default async function WalletPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("Wallet");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id) redirect("/dashboard/staff");

  const [balanceData, requests] = await Promise.all([
    getCompanyBalance(supabase, profile.company_id),
    getWithdrawalRequests(supabase, profile.company_id)
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{t("title")}</h1>
        <p className="text-gray-500 text-sm mt-1">{t("subtitle")}</p>
      </div>

      <WalletClient 
        locale={locale}
        balance={balanceData?.balance ?? 0}
        iban={balanceData?.iban ?? ""}
        country={balanceData?.country ?? ""}
        bankName={balanceData?.bank_name ?? ""}
        requests={requests}
        profileId={user.id}
        companyId={profile.company_id}
      />
    </div>
  );
}
