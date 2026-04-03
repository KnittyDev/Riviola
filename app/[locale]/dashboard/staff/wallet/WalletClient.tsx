"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "@/lib/toast";
import { useRouter } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { createWithdrawalRequest } from "@/lib/wallet";

export default function WalletClient({
  locale,
  balance,
  iban,
  country,
  bankName,
  currency,
  bankAccountHolder,
  requests,
  profileId,
  companyId
}: {
  locale: string;
  balance: number;
  iban: string;
  country: string;
  bankName: string;
  currency: string;
  bankAccountHolder: string;
  requests: any[];
  profileId: string;
  companyId: string;
}) {
  const t = useTranslations("Wallet");
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const currencies = [
    { code: "EUR", symbol: "€" },
    { code: "USD", symbol: "$" },
    { code: "TRY", symbol: "₺" },
    { code: "GBP", symbol: "£" }
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const withdrawAmount = parseFloat(amount);

    if (isNaN(withdrawAmount) || withdrawAmount <= 0) return;
    if (withdrawAmount > balance) {
      toast.error(t("insufficientBalance"));
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    // The backend now automatically uses the bankAccountHolder from the company profile
    const { error } = await createWithdrawalRequest(
      supabase,
      companyId,
      profileId,
      withdrawAmount,
      iban,
      bankName,
      currency
    );

    if (error) {
      toast.error(t("errorRequest"));
      setSubmitting(false);
      return;
    }

    toast.success(t("successRequest"));
    setAmount("");
    setSubmitting(false);
    setIsSuccess(true);

    // Auto close after 2.5 seconds
    setTimeout(() => {
      setIsSuccess(false);
      setShowWithdraw(false);
      router.refresh();
    }, 2500);
  }

  const getCurrencySymbol = (code: string) => {
    return currencies.find(c => c.code === code)?.symbol || code;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Balance Card */}
      <div className="bg-[#134e4a] rounded-[3rem] p-10 sm:p-14 text-white shadow-2xl relative overflow-hidden group border border-white/10">
        <div className="absolute -right-20 -top-20 size-80 bg-white/5 rounded-full blur-3xl transition-transform group-hover:scale-110 duration-1000" />
        <div className="absolute -left-20 -bottom-20 size-80 bg-teal-400/10 rounded-full blur-3xl transition-transform group-hover:scale-110 duration-1000" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
               <div className="size-2 bg-teal-400 rounded-full animate-pulse" />
               <p className="text-teal-200/60 font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs">{t("balance")}</p>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-4xl font-black opacity-40 -mr-1">{getCurrencySymbol(currency)}</span>
              <span className="text-5xl sm:text-7xl font-black tracking-tighter drop-shadow-sm">
                {balance.toLocaleString(locale === "tr" ? "tr-TR" : "en-US", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xl sm:text-2xl font-black opacity-20 tracking-widest ml-1">{currency}</span>
            </div>
          </div>
          <button
            onClick={() => setShowWithdraw(!showWithdraw)}
            className="inline-flex items-center gap-3 px-10 py-5 rounded-[2rem] bg-white text-[#134e4a] font-black hover:bg-teal-50 transition-all hover:scale-105 shadow-2xl shadow-black/20 active:scale-95 text-sm sm:text-base whitespace-nowrap group/btn"
          >
            <i className={`las ${showWithdraw ? 'la-times' : 'la-arrow-up'} text-xl group-hover/btn:rotate-12 transition-transform`} />
            {showWithdraw ? t("cancel") : t("withdraw")}
          </button>
        </div>
      </div>

      {/* Withdrawal Form */}
      {showWithdraw && !isSuccess && (
        <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] border border-gray-100 p-10 sm:p-14 shadow-2xl space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 pl-1">{t("amount")}</label>
                   <div className="relative group">
                      <input
                        required
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-12 pr-4 py-5 rounded-3xl border-2 border-gray-50 bg-gray-50/30 focus:border-[#134e4a] focus:bg-white outline-none transition-all font-black text-gray-900 shadow-sm group-hover:bg-gray-50"
                        placeholder="0.00"
                      />
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#134e4a] font-black text-xl pointer-events-none">
                        {getCurrencySymbol(currency)}
                      </div>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-white/60 px-2 py-0.5 rounded-md border border-gray-200">
                         <i className="las la-lock text-xs text-teal-600" />
                         <span className="text-[8px] uppercase text-gray-400 font-bold">{currency} Only</span>
                      </div>
                   </div>
                </div>
              </div>

              <div className="p-6 bg-[#134e4a]/5 rounded-3xl border border-[#134e4a]/10 backdrop-blur-sm shadow-inner group">
                <div className="flex items-center gap-3 mb-4">
                   <div className="size-8 bg-[#134e4a] rounded-lg flex items-center justify-center text-white text-xs">
                      <i className="las la-address-card" />
                   </div>
                   <h4 className="text-[10px] font-black text-[#134e4a] uppercase tracking-[0.2em]">Verified Settlement Account</h4>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Bank Account Name</label>
                    <p className="text-sm font-black text-gray-900 tracking-tight">{bankAccountHolder || "—"}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#134e4a]/5">
                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">{t("iban")}</label>
                      <p className="font-mono text-xs font-black text-gray-700 break-all leading-relaxed">{iban || "—"}</p>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Country / Jurisdiction</label>
                      <p className="text-[11px] font-black text-gray-700 uppercase tracking-widest leading-tight">{country || "—"}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[#134e4a]/5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">{t("bank")}</label>
                    <p className="text-[11px] font-black text-gray-700 uppercase tracking-widest leading-tight">{bankName || "—"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#134e4a]/5 rounded-[3rem] p-10 border border-[#134e4a]/10 flex flex-col justify-between relative overflow-hidden group/info">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#134e4a]/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover/info:scale-110 transition-transform duration-700" />
              <div className="relative">
                <div className="size-14 bg-[#134e4a] rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-[#134e4a]/20">
                   <i className="las la-shield-alt text-2xl" />
                </div>
                <h3 className="text-[#134e4a] font-black uppercase tracking-[0.2em] text-xs mb-4">Transfer Protocols</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium font-inter">
                  All requests are processed using the pre-approved company settlement accounts. Processing typically takes <span className="text-[#134e4a] font-black">1-3 business days</span>. Settlements are executed in the fixed company currency: <span className="text-[#134e4a] font-black">{currency}</span>.
                </p>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-10 py-5 rounded-[2rem] bg-[#134e4a] text-white font-black hover:bg-[#115e59] disabled:opacity-50 transition-all shadow-2xl shadow-[#134e4a]/30 hover:shadow-[#134e4a]/50 active:scale-[0.98] uppercase text-xs tracking-[0.2em]"
              >
                {submitting ? t("sending") : t("withdraw")}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Success Animation View */}
      {isSuccess && (
        <div className="bg-white rounded-[3rem] border-2 border-emerald-100 p-24 shadow-2xl flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-700">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" />
            <div className="size-32 rounded-full bg-emerald-500 text-white flex items-center justify-center relative shadow-2xl shadow-emerald-500/40">
              <i className="las la-check text-6xl animate-in slide-in-from-bottom-4 duration-1000 delay-100" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-3xl font-black text-[#134e4a] tracking-tight">{t("successRequest")}</h3>
            <p className="text-gray-400 text-xs font-black uppercase tracking-[0.3em] mt-4 flex items-center justify-center gap-3">
               <span className="size-1.5 bg-amber-400 rounded-full animate-bounce" />
               {t("pending")}...
            </p>
          </div>
        </div>
      )}

      {/* Requests History */}
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
        <div className="p-10 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
             <i className="las la-history text-2xl text-orange-600" />
             {t("requests")}
          </h2>
          <span className="bg-gray-100 text-gray-400 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Global Record</span>
        </div>

        {requests.length === 0 ? (
          <div className="p-24 text-center">
            <div className="size-24 rounded-full bg-gray-50 text-gray-200 flex items-center justify-center mx-auto mb-8 shadow-inner">
              <i className="las la-inbox text-5xl" />
            </div>
            <p className="text-gray-400 font-black uppercase text-xs tracking-widest">{t("noRequests")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/20 border-b border-gray-50">
                  <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("amount")}</th>
                  <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("status")}</th>
                  <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Account</th>
                  <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">{t("date")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-inter">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 font-black text-gray-900 text-lg tabular-nums">
                          <span>{getCurrencySymbol(r.currency)}</span>
                          <span>{Number(r.amount).toLocaleString(locale === "tr" ? "tr-TR" : "en-US", { minimumFractionDigits: 2 })}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1 opacity-60">
                           Settlement: {r.currency || "EUR"}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${r.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-500/5' :
                          r.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100 shadow-rose-500/5' :
                            'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-500/5'
                        }`}>
                        {t(r.status.toLowerCase())}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                       <div className="flex flex-col gap-1.5">
                          <span className="font-mono text-[11px] font-black text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg w-fit group-hover:bg-[#134e4a]/5 group-hover:text-[#134e4a] transition-colors tracking-tight">
                            {r.iban}
                          </span>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 pl-1">
                            <i className="las la-user-circle text-sm opacity-50" />
                            {r.account_holder_name || "—"}
                          </span>
                        </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <div className="flex flex-col items-end">
                          <span className="text-sm font-black text-gray-900 leading-tight">
                            {new Date(r.created_at).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}
                          </span>
                          <span className="text-[10px] text-gray-300 font-bold uppercase tracking-tighter mt-1">Ref: {r.id.slice(0, 8)}</span>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
