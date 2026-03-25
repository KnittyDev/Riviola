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
  requests,
  profileId,
  companyId
}: {
  locale: string;
  balance: number;
  iban: string;
  country: string;
  bankName: string;
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

    // 1. Withdrawal request using default company IBAN

    // 2. Create request for it
    const { error } = await createWithdrawalRequest(
      supabase,
      companyId,
      profileId,
      withdrawAmount,
      iban,
      bankName
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

    // Auto close after 3 seconds
    setTimeout(() => {
      setIsSuccess(false);
      setShowWithdraw(false);
      router.refresh();
    }, 2500);
  }

  return (
    <div className="space-y-8">
      {/* Balance Card */}
      <div className="bg-[#134e4a] rounded-[2rem] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute -right-16 -top-16 size-64 bg-white/5 rounded-full blur-3xl transition-transform group-hover:scale-110 duration-700" />
        <div className="absolute -left-16 -bottom-16 size-64 bg-teal-400/10 rounded-full blur-3xl transition-transform group-hover:scale-110 duration-700" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-8">
          <div>
            <p className="text-teal-200/80 font-bold uppercase tracking-widest text-[10px] sm:text-xs mb-2">{t("balance")}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-6xl font-black tracking-tighter">
                {balance.toLocaleString(locale === "tr" ? "tr-TR" : "en-US", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-2xl sm:text-3xl font-bold opacity-60">EUR</span>
            </div>
          </div>
          <button
            onClick={() => setShowWithdraw(!showWithdraw)}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-[#134e4a] font-black hover:bg-teal-50 transition-all hover:scale-105 shadow-xl shadow-black/10 active:scale-95 text-sm sm:text-base whitespace-nowrap"
          >
            <i className={`las ${showWithdraw ? 'la-times' : 'la-arrow-up'} text-xl`} />
            {showWithdraw ? t("cancel") : t("withdraw")}
          </button>
        </div>
      </div>

      {/* Withdrawal Form */}
      {showWithdraw && !isSuccess && (
        <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] border border-gray-100 p-8 sm:p-10 shadow-xl space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">{t("amount")}</label>
                <div className="relative">
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-[#134e4a] focus:ring-4 focus:ring-[#134e4a]/10 outline-none transition-all font-bold text-lg"
                    placeholder="0.00"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#134e4a] font-black text-lg">€</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">{t("iban")}</label>
                  <p className="font-mono text-sm font-bold text-gray-700 truncate">{iban || "—"}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Country</label>
                  <p className="text-sm font-bold text-gray-700">{country || "—"}</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">{t("bank")}</label>
                <p className="text-sm font-bold text-gray-700">{bankName || "—"}</p>
              </div>
            </div>

            <div className="bg-gray-50/50 rounded-3xl p-8 border border-gray-100 flex flex-col justify-between">
              <div>
                <h3 className="text-[#134e4a] font-black uppercase tracking-widest text-xs mb-4">Security Info</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Withdrawal requests are typically processed within 1-3 business days. Please ensure your IBAN and Country details are correct to avoid delays.
                </p>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-8 py-4 rounded-2xl bg-[#134e4a] text-white font-black hover:bg-[#115e59] disabled:opacity-50 transition-all shadow-lg shadow-[#134e4a]/20"
              >
                {submitting ? t("sending") : t("withdraw")}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Success Animation View */}
      {isSuccess && (
        <div className="bg-white rounded-[2rem] border-2 border-emerald-100 p-20 shadow-xl flex flex-col items-center justify-center space-y-6 animate-in zoom-in-95 duration-500">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-2xl animate-pulse" />
            <div className="size-24 rounded-full bg-emerald-500 text-white flex items-center justify-center relative shadow-lg shadow-emerald-500/30">
              <i className="las la-check text-5xl animate-in slide-in-from-bottom-2 duration-700 delay-100" />
            </div>
          </div>
          <div className="text-center group">
            <h3 className="text-2xl font-black text-[#134e4a] tracking-tight">{t("successRequest")}</h3>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-2">{t("pending")}...</p>
          </div>
        </div>
      )}

      {/* Requests History */}
      <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-extrabold text-gray-900 tracking-tight">{t("requests")}</h2>
        </div>

        {requests.length === 0 ? (
          <div className="p-20 text-center">
            <div className="size-20 rounded-full bg-gray-50 text-gray-300 flex items-center justify-center mx-auto mb-6">
              <i className="las la-history text-4xl" />
            </div>
            <p className="text-gray-500 font-medium text-lg">{t("noRequests")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">{t("amount")}</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">{t("status")}</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">{t("iban")}</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">{t("date")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-1.5 font-bold text-gray-900">
                        <span>{Number(r.amount).toLocaleString(locale === "tr" ? "tr-TR" : "en-US", { minimumFractionDigits: 2 })}</span>
                        <span className="text-xs opacity-40">EUR</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${r.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          r.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                            'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                        {t(r.status.toLowerCase())}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-500 font-mono tracking-tight">{r.iban}</td>
                    <td className="px-8 py-6 text-sm text-gray-500 font-medium">
                      {new Date(r.created_at).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
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
