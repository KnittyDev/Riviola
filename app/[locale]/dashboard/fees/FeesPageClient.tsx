"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "@/lib/toast";
import type { InvestorDuesFeeItem, CompanyForInvoice } from "@/lib/investorDues";
import {
  createDuesCheckoutSessionAction,
  confirmDuesPaymentFromSessionAction,
} from "./actions";
import { downloadDuesPdf } from "@/lib/duesPdf";

type FeeStatus = "paid" | "due" | "overdue";

function formatPaidAt(paidAt: string | null): string {
  if (!paidAt) return "Paid";
  try {
    const d = new Date(paidAt);
    const dateStr = d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const timeStr = d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `Paid on ${dateStr}, ${timeStr}`;
  } catch {
    return "Paid";
  }
}

const statusConfig: Record<
  FeeStatus,
  { label: string; className: string; dotClass: string }
> = {
  paid: {
    label: "Paid",
    className: "bg-emerald-100 text-emerald-700",
    dotClass: "bg-emerald-600",
  },
  due: {
    label: "Due",
    className: "bg-amber-100 text-amber-700",
    dotClass: "bg-amber-500",
  },
  overdue: {
    label: "Overdue",
    className: "bg-red-100 text-red-700",
    dotClass: "bg-red-600",
  },
};

type Props = {
  fees: InvestorDuesFeeItem[];
  company: CompanyForInvoice | null;
};

export function FeesPageClient({ fees, company }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [payingId, setPayingId] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      confirmDuesPaymentFromSessionAction(sessionId).then((result) => {
        if (result.ok) {
          toast.success("Payment completed. Thank you.");
        } else {
          toast.error(result.error ?? "Could not confirm payment.");
        }
        router.replace("/dashboard/fees", { scroll: false });
        router.refresh();
      });
      return;
    }
    if (searchParams.get("success") === "1") {
      toast.success("Payment completed. Thank you.");
      router.replace("/dashboard/fees", { scroll: false });
    }
  }, [searchParams, router]);

  const currencySymbols: Record<string, string> = {
    EUR: "€", USD: "$", GBP: "£", TRY: "₺", CHF: "Fr", AUD: "A$",
    CAD: "C$", NOK: "kr", SEK: "kr", AED: "د.إ", SAR: "﷼", ALL: "L",
  };

  function formatTotalByCurrency(
    items: InvestorDuesFeeItem[]
  ): string {
    const totalByCurrency: Record<string, number> = {};
    items.forEach((f) => {
      const cur = f.currency ?? "EUR";
      totalByCurrency[cur] = (totalByCurrency[cur] ?? 0) + (f.amountCents ?? 0) / 100;
    });
    const parts = Object.entries(totalByCurrency).map(([cur, total]) => {
      const sym = currencySymbols[cur] ?? cur + " ";
      return `${sym} ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
    });
    return parts.length > 0 ? parts.join(" + ") : "€ 0.00";
  }

  const unpaidItems = fees.filter((f) => f.status === "due" || f.status === "overdue");
  const totalDueFormatted = formatTotalByCurrency(unpaidItems);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const paidThisMonth = fees.filter((f) => {
    if (f.status !== "paid" || !f.paid_at) return false;
    const paidDate = new Date(f.paid_at);
    return paidDate.getFullYear() === currentYear && paidDate.getMonth() === currentMonth;
  });
  const paidThisMonthFormatted = formatTotalByCurrency(paidThisMonth);

  const nextDue = fees
    .filter((f) => f.status === "due" || f.status === "overdue")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

  const handlePay = async (row: InvestorDuesFeeItem) => {
    if (row.status === "paid") return;
    setPayingId(row.id);
    const result = await createDuesCheckoutSessionAction(
      row.investor_property_id,
      row.periodKey
    );
    setPayingId(null);
    if (!result.ok) {
      toast.error(result.error ?? "Payment could not be started.");
      return;
    }
    if (result.url) {
      window.location.href = result.url;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 animate-fade-in">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            Fees & Payments
          </h1>
          <p className="text-gray-500 text-base">
            Track and pay apartment and building fees — common charges (aidat) and related expenses.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm animate-fade-in-up">
          <p className="text-sm font-medium text-gray-500 mb-1">Total due</p>
          <p className="text-2xl font-bold text-gray-900">
            {totalDueFormatted}
          </p>
          <p className="text-xs text-amber-600 font-medium mt-1">
            {unpaidItems.length} item(s) to pay
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm animate-fade-in-up delay-100">
          <p className="text-sm font-medium text-gray-500 mb-1">Paid this month</p>
          <p className="text-2xl font-bold text-emerald-600">
            {paidThisMonthFormatted}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {paidThisMonth.length} payment(s)
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm animate-fade-in-up delay-150">
          <p className="text-sm font-medium text-gray-500 mb-1">Next due date</p>
          <p className="text-2xl font-bold text-gray-900">
            {nextDue ? nextDue.dueDate : "—"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {nextDue ? "Common charges (Aidat)" : "No upcoming dues"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">
            All fees and expenses
          </h3>
          <div className="flex gap-2 items-center">
            <button
              type="button"
              onClick={() => downloadDuesPdf(fees, company)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:border-[#134e4a] hover:text-[#134e4a] transition-colors"
              title="Download dues summary (Invoice)"
            >
              <i className="las la-file-invoice text-lg" aria-hidden />
              Download Invoice
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Building / Unit
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Due date
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {fees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No dues recorded yet. Dues appear here once your building manager configures payment windows for your units.
                  </td>
                </tr>
              ) : (
                fees.map((row) => {
                  const status = statusConfig[row.status] ?? statusConfig.due;
                  const isOverdue = row.status === "overdue";
                  return (
                    <tr
                      key={row.id}
                      className={`group transition-colors ${
                        isOverdue ? "bg-red-50/30 hover:bg-red-50/50" : "hover:bg-gray-50/80"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{row.building}</p>
                          <p className="text-xs text-gray-500">{row.unit}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          Common charges (Aidat)
                        </p>
                        <p className="text-xs text-gray-500">{row.description}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{row.period}</td>
                      <td
                        className={`px-6 py-4 text-sm font-medium ${
                          isOverdue ? "text-red-600" : "text-gray-600"
                        }`}
                      >
                        {row.dueDate}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        {row.amountFormatted}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.className}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => downloadDuesPdf([row], company)}
                          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-[#134e4a] text-xs font-medium transition-colors"
                          title={`Download invoice: ${row.period} – ${row.building}`}
                        >
                          <i className="las la-file-invoice text-base" aria-hidden />
                          Invoice
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {row.status === "paid" ? (
                          <span className="text-xs text-gray-500 font-medium" title={row.paid_at ?? undefined}>
                            {formatPaidAt(row.paid_at)}
                            {row.payment_number && (
                              <span className="block mt-0.5 font-mono text-[#134e4a]">
                                {row.payment_number}
                              </span>
                            )}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handlePay(row)}
                            disabled={payingId !== null}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#134e4a] text-white text-sm font-semibold hover:bg-[#115e59] transition-colors disabled:opacity-60"
                          >
                            <i className="las la-credit-card text-base" aria-hidden />
                            {payingId === row.id ? "Sending…" : "Pay"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-sm text-gray-500 mt-6">
        Click &quot;Pay&quot; to pay with Stripe. Amount must be set by your building manager for the Pay button to work.
      </p>
    </div>
  );
}
