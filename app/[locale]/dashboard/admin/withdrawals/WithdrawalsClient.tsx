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
  currency: string;
  bank_name: string | null;
  note: string | null;
  created_at: string;
  companies: {
    name: string;
    bank_name: string | null;
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
        <p className="text-gray-500 font-medium font-inter">Manage and process company withdrawal requests with automatic company balance rollback on rejection.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Company / Requester</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Bank Details</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Amount</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400 text-center">Status</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-inter">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-gray-400 font-medium italic">
                    No withdrawal requests found.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-900 leading-tight mb-0.5">
                          {req.companies?.name || "Unknown Company"}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                          {req.profiles?.full_name || "Unknown Staff"}
                        </span>
                        <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">
                          {new Date(req.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900 tracking-tight mb-1">
                          {req.companies?.bank_name || "N/A"}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md font-bold">
                            {req.iban}
                          </span>
                        </div>
                        {req.note && (
                          <p className="text-[10px] text-gray-400 mt-2 italic max-w-xs line-clamp-2 leading-relaxed">
                            "{req.note}"
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-xl font-black text-gray-900 tabular-nums">
                          {getCurrencySymbol(req.currency || req.profiles?.currency)}{req.amount.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                           {req.currency || req.profiles?.currency || "EUR"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <span className={`
                          px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest
                          ${req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 
                            req.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 
                            'bg-amber-100 text-amber-700'}
                        `}>
                          {req.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end gap-2 isolate">
                        {req.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(req.id, "Rejected")}
                              disabled={loadingId === req.id}
                              className="size-10 rounded-xl bg-gray-100 text-gray-500 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center disabled:opacity-50"
                              title="Reject"
                            >
                              <i className="las la-times text-xl" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(req.id, "Approved")}
                              disabled={loadingId === req.id}
                              className="size-10 rounded-xl bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-600/20 transition-all flex items-center justify-center disabled:opacity-50 scale-110"
                              title="Approve"
                            >
                              <i className="las la-check text-xl" />
                            </button>
                          </>
                        )}
                        {req.status !== 'Pending' && (
                          <span className="text-xs font-black text-gray-300 uppercase tracking-widest">Processed</span>
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
