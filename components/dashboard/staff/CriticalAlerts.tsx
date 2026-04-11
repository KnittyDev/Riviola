"use client";

import Link from "next/link";
import type { StaffRecentPaymentItem, StaffOverdueDueItem } from "@/lib/duesPayments";
import { useTranslations, useLocale } from "next-intl";

function formatPaidAt(paidAt: string, locale: string): string {
  try {
    const d = new Date(paidAt);
    const dateStr = d.toLocaleDateString(locale === "tr" ? "tr-TR" : "en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const timeStr = d.toLocaleTimeString(locale === "tr" ? "tr-TR" : "en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `${dateStr}, ${timeStr}`;
  } catch {
    return paidAt;
  }
}

type Props = {
  recentPayments: StaffRecentPaymentItem[];
  overdueDues: StaffOverdueDueItem[];
  pendingRequests?: any[]; // For demo/extensibility
};

export function CriticalAlerts({ recentPayments, overdueDues, pendingRequests = [] }: Props) {
  const t = useTranslations("Staff.alerts");
  const locale = useLocale();
  const totalAlerts = overdueDues.length + pendingRequests.length;
  const hasItems = recentPayments.length > 0 || overdueDues.length > 0 || pendingRequests.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">{t("title")}</h3>
        {totalAlerts > 0 && (
          <span className="flex items-center justify-center size-6 rounded-full bg-red-500 text-white text-xs font-bold">
            {totalAlerts}
          </span>
        )}
      </div>
      <div className="flex-1 overflow-auto">
        {pendingRequests.length > 0 && (
          <div className="px-6 py-3">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">
              Pending Requests
            </p>
            <ul className="space-y-2">
              {pendingRequests.map((req) => (
                <li
                  key={req.id}
                  className="flex gap-3 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100 hover:bg-blue-50/80 transition-colors"
                >
                  <div className="size-9 rounded-lg flex items-center justify-center shrink-0 bg-blue-100 text-blue-600">
                    <i className="las la-clock text-sm" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {req.investorName} · {req.type}
                    </p>
                    <p className="text-xs text-blue-600 font-medium">
                      {req.buildingName} · {req.requestedAt}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {overdueDues.length > 0 && (
          <div className={`px-6 py-3 ${pendingRequests.length > 0 ? 'border-t border-gray-100' : ''}`}>
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">
              {t("overdue")}
            </p>
            <ul className="space-y-2">
              {overdueDues.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-3 px-3 py-2 rounded-xl bg-red-50 border border-red-100 hover:bg-red-50/80 transition-colors"
                >
                  <div className="size-9 rounded-lg flex items-center justify-center shrink-0 bg-red-100 text-red-600">
                    <i className="las la-exclamation-triangle text-sm" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {item.buildingName} · {item.unit}
                    </p>
                    <p className="text-xs text-red-600 font-medium">
                      {item.period} — {t("dueOn", { date: item.dueDate })}
                      {item.investorName ? ` · ${item.investorName}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {recentPayments.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">
              {t("recent")}
            </p>
            <ul className="space-y-2">
              {recentPayments.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-3 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-50/80 transition-colors"
                >
                  <div className="size-9 rounded-lg flex items-center justify-center shrink-0 bg-emerald-100 text-emerald-600">
                    <i className="las la-check-circle text-sm" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {item.buildingName} · {item.unit}
                    </p>
                    <p className="text-xs text-emerald-700">
                      {item.period} — {t("paidOn", { date: formatPaidAt(item.paid_at, locale) })}
                      {item.investorName ? ` · ${item.investorName}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {!hasItems && (
          <div className="px-6 py-8 text-center text-gray-500 text-sm">
            <p>{t("noItems")}</p>
            <p className="mt-1 text-xs">{t("trackingInfo")}</p>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-gray-100">
        <Link
          href="/dashboard/staff/aidat-payments"
          className="block w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-center"
        >
          {useTranslations("Navigation")("financials")}
        </Link>
      </div>
    </div>
  );
}
