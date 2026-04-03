"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { updateWithdrawalStatus } from "@/lib/wallet";
import { toast } from "@/lib/toast";

interface WithdrawalRequest {
  id: string;
  amount: number;
  status: string;
  iban: string;
  account_holder_name: string | null;
  currency: string;
  bank_name: string | null;
  note: string | null;
  created_at: string;
  companies: {
    name: string;
    bank_name: string | null;
    bank_account_holder: string | null;
  };
  profiles: {
    full_name: string | null;
    currency: string | null;
  };
}

export function WithdrawalsClient({ initialRequests }: { initialRequests: WithdrawalRequest[] }) {
  const commonT = useTranslations("Sidebar");
  const [requests, setRequests] = useState(initialRequests);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  async function handleUpdateStatus(id: string, newStatus: "Approved" | "Rejected") {
    setLoadingId(id);
    const supabase = createClient();

    try {
      const { error, ok } = await updateWithdrawalStatus(supabase, id, newStatus);

      if (error) throw new Error(error);

      if (ok) {
        toast.success(`Request ${newStatus.toLowerCase()} successfully`);
        setRequests(prev => 
          prev.map(r => r.id === id ? { ...r, status: newStatus } : r)
        );
        router.refresh();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update status");
    } finally {
      setLoadingId(null);
    }
  }

  const getCurrencySymbol = (code?: string | null) => {
    if (!code) return "€";
    switch (code.toUpperCase()) {
      case "USD": return "$";
      case "EUR": return "€";
      case "GBP": return "£";
      case "TRY": return "₺";
      default: return code;
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">{commonT("withdrawRequests")}</h1>
        <p className="text-gray-500 font-medium font-inter">Administrative terminal for auditing and processing organizational divestment triggers.</p>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Entity / Requester</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Settlement Destination</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Amount</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Status</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Clearance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-inter">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                       <div className="size-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-200">
                          <i className="las la-inbox text-4xl" />
                       </div>
                       <p className="text-xs text-gray-400 font-bold uppercase tracking-widest italic">Stable Infrastructure - No Pending Triggers</p>
                    </div>
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/30 transition-all group">
                    <td className="px-10 py-8">
                       <div className="flex items-center gap-4">
                          <div className="size-12 rounded-xl bg-[#134e4a]/5 flex items-center justify-center text-[#134e4a] shrink-0 border border-[#134e4a]/10">
                             <i className="las la-building text-2xl" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-black text-gray-900 leading-tight mb-1 truncate">
                              {req.companies?.name || "Global Entity"}
                            </span>
                            <div className="flex items-center gap-2">
                               <div className="size-4 rounded-full bg-gray-100 flex items-center justify-center">
                                  <i className="las la-user text-[10px] text-gray-400" />
                               </div>
                               <span className="text-[11px] text-gray-500 font-bold tracking-tight truncate">
                                 {req.profiles?.full_name || "System Automated"}
                               </span>
                            </div>
                          </div>
                       </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-center gap-3">
                           <div className="flex flex-col">
                              <span className="text-[11px] font-black text-gray-900 tracking-tight leading-none">
                                {req.account_holder_name || req.companies?.bank_account_holder || "N/A"}
                              </span>
                              <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1">Beneficiary Account</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-100/50 flex flex-col">
                              <span className="text-[8px] text-orange-400 font-black uppercase tracking-tighter mb-0.5">{req.bank_name || req.companies?.bank_name || "Primary Institution"}</span>
                              <span className="font-mono text-[10px] text-orange-700 font-black tracking-tight">{req.iban}</span>
                           </div>
                        </div>
                        {req.note && (
                          <div className="flex items-start gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                             <i className="las la-comment-alt text-gray-300 text-sm mt-0.5" />
                             <p className="text-[10px] text-gray-400 font-medium italic leading-relaxed line-clamp-2">
                               {req.note}
                             </p>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-1">
                           <span className="text-[10px] font-black text-gray-400 mr-0.5">{getCurrencySymbol(req.currency)}</span>
                           <span className="text-2xl font-black text-gray-900 tabular-nums tracking-tighter">
                             {req.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                           </span>
                        </div>
                        <span className="text-[9px] text-gray-300 font-black uppercase tracking-[0.2em] mt-1">
                           {req.currency || "EUR"} DIVESTMENT
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <div className="flex justify-center">
                        <span className={`
                          px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm border
                          ${req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                            req.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                            'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'}
                        `}>
                          {req.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex justify-end gap-3 isolate">
                        {req.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(req.id, "Rejected")}
                              disabled={loadingId === req.id}
                              className="size-11 rounded-2xl bg-white text-gray-400 border border-gray-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all flex items-center justify-center disabled:opacity-50 shadow-sm active:scale-95"
                              title="Reject Request"
                            >
                              <i className="las la-times text-xl" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(req.id, "Approved")}
                              disabled={loadingId === req.id}
                              className="size-11 rounded-2xl bg-[#134e4a] text-white hover:bg-[#115e59] shadow-xl shadow-[#134e4a]/20 transition-all flex items-center justify-center disabled:opacity-50 active:scale-95 border border-[#134e4a]"
                              title="Authorize Transfer"
                            >
                              <i className="las la-check text-xl font-bold" />
                            </button>
                          </>
                        )}
                        {req.status !== 'Pending' && (
                          <div className="flex items-center gap-2 text-gray-300 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                             <i className={`las ${req.status === 'Approved' ? 'la-check-circle' : 'la-ban'} text-lg`} />
                             <span className="text-[9px] font-black uppercase tracking-widest">Finalized</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
