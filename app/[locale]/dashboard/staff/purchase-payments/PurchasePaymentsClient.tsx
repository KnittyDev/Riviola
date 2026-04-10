"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo } from "react";
import { toast } from "@/lib/toast";
import type { BuyerUnitWithInstallments } from "@/lib/purchaseInstallments";
import {
  createPurchasePlanAction,
  markInstallmentPaidAction,
  unmarkInstallmentPaidAction,
  deletePurchasePlanAction,
} from "./actions";
import { useTranslations, useLocale } from "next-intl";

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
  ALL: "L",
};

function formatAmount(value: number, currency: string, locale: string): string {
  const sym = CURRENCY_SYMBOLS[currency] ?? currency + " ";
  const formatted = value.toLocaleString(locale === "tr" ? "tr-TR" : locale === "sr" ? "sr-RS" : locale === "sq" ? "sq-AL" : "en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return sym === "€" || sym === "£" || sym === "₺" ? `${formatted} ${sym}` : `${sym}${formatted}`;
}

function formatDate(dateStr: string | null, locale: string): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString(locale === "tr" ? "tr-TR" : locale === "sr" ? "sr-RS" : locale === "sq" ? "sq-AL" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "—";
  }
}

type Building = { id: string; name: string };

type Props = {
  buildings: Building[];
  selectedBuildingId: string;
  blocks: string[];
  selectedBlock: string;
  selectedUnitId: string;
  units: BuyerUnitWithInstallments[];
  unitsInBlock: BuyerUnitWithInstallments[];
};

export function PurchasePaymentsClient({
  buildings,
  selectedBuildingId,
  blocks,
  selectedBlock,
  selectedUnitId,
  units,
  unitsInBlock,
}: Props) {
  const t = useTranslations("Purchase");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [addingPlanFor, setAddingPlanFor] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending" | "unconfigured">("all");

  const STATUS_LABELS = {
    all: t("status.all"),
    paid: t("status.paid"),
    pending: t("status.pending"),
    unconfigured: t("status.unconfigured"),
  };

  const getOrdinal = (n: number) => {
    if (locale === "tr") return ".";
    const lastDigit = n % 10;
    if (n >= 11 && n <= 13) return "th";
    if (lastDigit === 1) return "st";
    if (lastDigit === 2) return "nd";
    if (lastDigit === 3) return "rd";
    return "th";
  };

  const formatLabel = (label: string) => {
    const l = label.toLowerCase();
    if (l === "full payment") return t("labels.full");
    if (l === "down payment") return t("labels.down");
    if (l.includes("installment")) {
      const numMatch = l.match(/\d+/);
      if (numMatch) {
        const n = parseInt(numMatch[0]);
        return t("labels.installment", { n, suffix: getOrdinal(n) });
      }
    }
    return label;
  };

  function updateParams(opts: { building?: string; block?: string; unit?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    if (opts.building != null) {
      params.set("building", opts.building);
      params.delete("block");
      params.delete("unit");
    }
    if (opts.block != null) {
      params.set("block", opts.block);
      params.set("unit", "__all__");
    }
    if (opts.unit != null) params.set("unit", opts.unit);
    router.push(`/dashboard/staff/purchase-payments?${params.toString()}`);
  }

  async function handleCreatePlan(
    investorPropertyId: string,
    planType: "full" | "installments",
    totalAmount: number,
    currency: string,
    downPaymentAmount: number,
    installmentCount: number,
    dueDate: string | null
  ) {
    const result = await createPurchasePlanAction({
      investorPropertyId,
      planType,
      totalAmount,
      currency,
      dueDate: dueDate?.trim() || null,
      downPaymentAmount: planType === "installments" ? downPaymentAmount : 0,
      installmentCount: planType === "installments" ? Math.max(1, installmentCount) : undefined,
    });
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(t("planCreated"));
    setAddingPlanFor(null);
    router.refresh();
  }

  async function handleMarkPaid(installmentId: string, isPaid: boolean) {
    setTogglingId(installmentId);
    const result = isPaid
      ? await unmarkInstallmentPaidAction(installmentId)
      : await markInstallmentPaidAction(installmentId);
    setTogglingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(isPaid ? t("unmarkedPaid") : t("markedPaid"));
    router.refresh();
  }

  async function handleDeletePlan(investorPropertyId: string) {
    if (!confirm(t("confirmDelete"))) return;
    const result = await deletePurchasePlanAction(investorPropertyId);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(t("planDeleted"));
    router.refresh();
  }

  // Pre-calculate counts for the filter bar
  const counts = useMemo(() => {
    let paid = 0;
    let pending = 0;
    let unconfigured = 0;
    let totalRecords = 0;

    unitsInBlock.forEach(u => {
        if (u.installments.length === 0) {
            unconfigured++;
            totalRecords++;
        } else {
            u.installments.forEach(inst => {
                if (inst.paid_at) paid++;
                else pending++;
                totalRecords++;
            });
        }
    });

    return { all: totalRecords, paid, pending, unconfigured };
  }, [unitsInBlock]);

  // Unified data source: Units + their Installments flat
  const allRows = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase().trim();
    
    // We sort primary by Unit ID/Label to keep them grouped
    return unitsInBlock.flatMap((u) => {
      const hasPlan = u.installments.length > 0;
      const matchesUnit = u.unit.toLowerCase().includes(lowerQuery) || 
                          (u.full_name?.toLowerCase().includes(lowerQuery) ?? false);

      // 1. Filter out by unconfigured status if applicable
      if (statusFilter === "unconfigured") {
        if (hasPlan) return [];
        if (lowerQuery && !matchesUnit) return [];
        return [{ type: "empty", unit: u, key: `empty-${u.id}` }];
      }

      // 2. Handle empty units in 'all' view
      if (!hasPlan) {
        if (statusFilter !== "all") return [];
        if (lowerQuery && !matchesUnit) return [];
        return [{ type: "empty", unit: u, key: `empty-${u.id}` }];
      }

      // 3. Filter installments by status and query
      const filteredInst = u.installments
        .filter(inst => {
          // Status match
          const isPaid = !!inst.paid_at;
          if (statusFilter === "paid" && !isPaid) return false;
          if (statusFilter === "pending" && isPaid) return false;

          // Search match
          return matchesUnit || inst.label.toLowerCase().includes(lowerQuery);
        })
        .sort((a, b) => (a.due_date || "").localeCompare(b.due_date || ""));

      if (lowerQuery && filteredInst.length === 0) return [];

      return filteredInst.map((inst) => ({
          type: "installment",
          unit: u,
          inst,
          key: inst.id,
        }));
    });
  }, [unitsInBlock, searchQuery, statusFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {t("title")}
        </h1>
        <p className="text-gray-500 mt-1">
          {t("subtitle")}
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700 shrink-0">{t("project")}</label>
            <select
              value={selectedBuildingId}
              onChange={(e) => updateParams({ building: e.target.value })}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 bg-white shadow-sm focus:border-[#134e4a] focus:ring-4 focus:ring-[#134e4a]/10 outline-none transition-all cursor-pointer"
            >
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          {units.length > 0 && blocks.length > 0 && (
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-gray-700 shrink-0">{t("block")}</label>
              <select
                value={selectedBlock}
                onChange={(e) => updateParams({ block: e.target.value })}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 bg-white shadow-sm focus:border-[#134e4a] focus:ring-4 focus:ring-[#134e4a]/10 outline-none transition-all cursor-pointer"
              >
                {blocks.map((bl) => (
                  <option key={bl} value={bl}>
                     {bl}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="relative w-full md:w-80 group">
           <i className="las la-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#134e4a] transition-colors text-lg" />
           <input
             type="text"
             placeholder={t("searchPlaceholder")}
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-10 py-3 text-sm font-bold placeholder:text-gray-400 focus:border-[#134e4a] focus:ring-4 focus:ring-[#134e4a]/10 outline-none shadow-sm transition-all"
           />
           {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
              >
                <i className="las la-times-circle" />
              </button>
           )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-8 p-1.5 bg-gray-100/50 rounded-2xl w-fit border border-gray-100">
          {(["all", "paid", "pending", "unconfigured"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${statusFilter === s ? "bg-white text-gray-900 shadow-md shadow-gray-200/50 scale-[1.02]" : "text-gray-500 hover:text-gray-700 hover:bg-white/50"}`}
              >
                {STATUS_LABELS[s]}
                <span className={`ml-1 px-2 py-0.5 rounded-lg text-[10px] font-black ${statusFilter === s ? "bg-[#134e4a] text-white" : "bg-gray-200 text-gray-500"}`}>
                    {counts[s]}
                </span>
              </button>
          ))}
      </div>

      {!selectedBuildingId ? (
                <div className="bg-gray-50 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                <i className="las la-building text-5xl text-gray-300 mb-4" />
                <p className="text-gray-500 font-bold">{t("selectBuilding")}</p>
              </div>
      ) : units.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-20 text-center text-gray-500">
          <i className="las la-search text-5xl text-gray-200 mb-4" />
          <p className="font-bold text-lg text-gray-900 mb-1">{t("noUnitsFound")}</p>
          <p>{t("noUnitsSubtitle")}</p>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in-up">
          <section className="space-y-4">
            <header className="flex flex-wrap items-center gap-4">
              <h2 className="text-2xl font-black text-gray-900 border-l-4 border-[#134e4a] pl-4">
                {t("unitsInBlock", { block: selectedBlock || "—" })}
              </h2>
              <div className="flex items-center gap-2 rounded-full bg-[#134e4a]/10 px-4 py-1.5 text-xs font-black text-[#134e4a] uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#134e4a] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#134e4a]"></span>
                </span>
                {t("unitsActive", { count: unitsInBlock.length })}
              </div>
            </header>

            <div className="bg-white rounded-[2rem] border border-gray-200 shadow-xl shadow-gray-200/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200 text-[10px] font-black text-gray-500 uppercase tracking-[0.1em]">
                      <th className="px-8 py-5">{t("table.unitInvestor")}</th>
                      <th className="px-8 py-5">{t("table.paymentPlan")}</th>
                      <th className="px-8 py-5">{t("table.dueDate")}</th>
                      <th className="px-8 py-5">{t("table.amount")}</th>
                      <th className="px-8 py-5 text-center">{t("table.status")}</th>
                      <th className="px-8 py-5 text-right">{t("table.actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 italic-none">
                    {allRows.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <i className="las la-filter text-4xl text-gray-200" />
                            <p className="text-gray-900 font-bold">{t("noRecordsFound")}</p>
                            <button 
                                onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
                                className="text-[#134e4a] text-xs font-bold hover:underline mt-2"
                            >
                                {t("clearFilters")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      allRows.map((row: any) => {
                        const isPlaceholder = row.type === "empty";
                        const u = row.unit;
                        const inst = row.inst;

                        return (
                          <tr key={row.key} className={`transition-all duration-200 ${isPlaceholder ? "bg-amber-50/20" : "hover:bg-gray-50/80"}`}>
                            <td className="px-8 py-5 whitespace-nowrap">
                              <div className="flex items-center gap-4">
                                <div className={`size-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm ${isPlaceholder ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                                  {u.unit}
                                </div>
                                <div>
                                  <p className="text-sm font-black text-gray-900">{u.unit}</p>
                                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{u.full_name ?? t("noInvestor")}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl text-xs shadow-sm ${isPlaceholder ? "bg-gray-100 text-gray-400" : (inst.paid_at ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}`}>
                                  <i className={`las ${isPlaceholder ? "la-lock" : "la-wallet"}`} />
                                </div>
                                <span className={`text-sm font-bold ${isPlaceholder ? "text-gray-400 italic" : "text-gray-900"}`}>
                                  {isPlaceholder ? t("noPlan") : formatLabel(inst.label)}
                                </span>
                              </div>
                            </td>
                            <td className="px-8 py-5 text-sm font-bold text-gray-600 uppercase">
                              {isPlaceholder ? "—" : formatDate(inst.due_date, locale)}
                            </td>
                            <td className="px-8 py-5 text-sm font-black text-gray-900">
                              {isPlaceholder ? "—" : formatAmount(Number(inst.amount), inst.currency, locale)}
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex justify-center">
                                  {isPlaceholder ? (
                                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-wider">
                                          <i className="las la-clock" /> {t("notSet")}
                                      </span>
                                  ) : (
                                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${inst.paid_at ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20" : "bg-amber-500/10 text-amber-700 border border-amber-500/20"}`}>
                                          <span className={`size-1.5 rounded-full ${inst.paid_at ? "bg-emerald-500" : "bg-amber-500"}`} />
                                          {inst.paid_at ? t("paid") : t("pending")}
                                      </span>
                                  )}
                              </div>
                            </td>
                            <td className="px-8 py-5 text-right">
                               <div className="flex items-center justify-end gap-2">
                                  {isPlaceholder ? (
                                      <button
                                          onClick={() => setAddingPlanFor(u.id)}
                                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#134e4a] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#115e59] shadow-lg shadow-[#134e4a]/20 transition-all hover:-translate-y-0.5"
                                      >
                                          <i className="las la-plus" /> {t("setPlan")}
                                      </button>
                                  ) : (
                                      <div className="flex items-center gap-3">
                                        <button
                                            disabled={togglingId === inst.id}
                                            onClick={() => handleMarkPaid(inst.id, !!inst.paid_at)}
                                            className={`text-[11px] font-black uppercase tracking-widest transition-all ${inst.paid_at ? "text-gray-400 hover:text-gray-600" : "text-[#134e4a] hover:underline"}`}
                                        >
                                            {togglingId === inst.id ? "..." : inst.paid_at ? t("unmark") : t("markPaid")}
                                        </button>
                                        
                                        {(inst.label.toLowerCase().includes("down") || inst.label.includes("1")) && (
                                            <button 
                                              onClick={() => handleDeletePlan(u.id)}
                                              className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                              title={t("deletePlan")}
                                            >
                                              <i className="las la-trash-alt" />
                                            </button>
                                        )}
                                      </div>
                                  )}
                               </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center py-4">
               {t("footer")}
            </p>
          </section>
        </div>
      )}

      {addingPlanFor && (
        <PlanModal
          unit={unitsInBlock.find(u => u.id === addingPlanFor)!}
          onClose={() => setAddingPlanFor(null)}
          onCreate={handleCreatePlan}
        />
      )}
    </div>
  );
}

function PlanModal({
  unit,
  onClose,
  onCreate,
}: {
  unit: BuyerUnitWithInstallments;
  onClose: () => void;
  onCreate: any;
}) {
  const t = useTranslations("Purchase.modal");
  const [planType, setPlanType] = useState<"full" | "installments">("full");
  const [totalAmount, setTotalAmount] = useState(unit.purchase_value != null ? String(unit.purchase_value) : "");
  const [currency, setCurrency] = useState(unit.purchase_currency ?? "EUR");
  const [downPayment, setDownPayment] = useState("");
  const [installmentCount, setInstallmentCount] = useState(6);
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  const totalNum = parseFloat(totalAmount) || 0;
  const downNum = parseFloat(downPayment) || 0;
  const canCreate = totalNum > 0 && (planType === "full" || (downNum >= 0 && downNum <= totalNum && installmentCount >= 1));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await onCreate(unit.id, planType, totalNum, currency, downNum, installmentCount, dueDate);
    setLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-black/5">
        <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">{t("title")}</h3>
            <div className="mt-1 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg bg-[#134e4a] text-white text-[10px] font-black uppercase tracking-wider">{unit.unit}</span>
                <span className="text-sm text-gray-500 font-bold tracking-tight">{unit.full_name ?? t("independentUnit")}</span>
            </div>
          </div>
          <button onClick={onClose} className="size-10 rounded-2xl hover:bg-white hover:shadow-md flex items-center justify-center transition-all group">
            <i className="las la-times text-2xl text-gray-400 group-hover:text-gray-900" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{t("planStructure")}</label>
              <select
                value={planType}
                onChange={(e) => setPlanType(e.target.value as any)}
                className="w-full rounded-2xl border border-gray-200 px-5 py-4 text-sm font-bold bg-gray-50/50 focus:bg-white focus:border-[#134e4a] focus:ring-4 focus:ring-[#134e4a]/10 outline-none transition-all cursor-pointer"
              >
                <option value="full">{t("fullPayment")}</option>
                <option value="installments">{t("downInstallments")}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{t("currency")}</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 px-5 py-4 text-sm font-bold bg-gray-50/50 focus:bg-white focus:border-[#134e4a] focus:ring-4 focus:ring-[#134e4a]/10 outline-none transition-all cursor-pointer"
              >
                {Object.entries(CURRENCY_SYMBOLS).map(([code, sym]) => (
                  <option key={code} value={code}>{code} ({sym})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{t("contractValue")}</label>
              <div className="relative">
                 <input
                    type="number"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 pl-5 pr-12 py-4 text-sm font-black focus:border-[#134e4a] focus:ring-4 focus:ring-[#134e4a]/10 outline-none transition-all"
                    placeholder="0.00"
                 />
                 <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400 uppercase">{currency}</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{t("startDate")}</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 px-5 py-4 text-sm font-bold focus:border-[#134e4a] focus:ring-4 focus:ring-[#134e4a]/10 outline-none transition-all"
              />
            </div>
          </div>

          {planType === "installments" && (
            <div className="grid grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-300">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{t("downPayment")}</label>
                <input
                  type="number"
                  value={downPayment}
                  onChange={(e) => setDownPayment(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 px-5 py-4 text-sm font-bold focus:border-[#134e4a] focus:ring-4 focus:ring-[#134e4a]/10 outline-none transition-all"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{t("installmentCount")}</label>
                <input
                  type="number"
                  value={installmentCount}
                  onChange={(e) => setInstallmentCount(Number(e.target.value))}
                  className="w-full rounded-2xl border border-gray-200 px-5 py-4 text-sm font-bold focus:border-[#134e4a] focus:ring-4 focus:ring-[#134e4a]/10 outline-none transition-all"
                  min={1}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 pt-8">
            <button
               type="button"
               onClick={onClose}
               className="flex-1 py-4.5 rounded-[1.5rem] border-2 border-gray-100 text-gray-500 text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={!canCreate || loading}
              className="flex-[2] py-4.5 rounded-[1.5rem] bg-[#134e4a] text-white text-xs font-black uppercase tracking-widest hover:bg-[#0f3d3a] shadow-2xl shadow-[#134e4a]/40 disabled:opacity-50 transition-all hover:-translate-y-1"
            >
              {loading ? (
                  <div className="flex items-center justify-center gap-2">
                     <i className="las la-spinner animate-spin text-lg" />
                     {t("processing")}
                  </div>
              ) : t("initialize")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
