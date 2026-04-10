"use client";

import type { PurchaseInstallmentWithProperty } from "@/lib/purchaseInstallments";
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

function formatAmount(value: number, currency: string, locale: string) {
  const sym = CURRENCY_SYMBOLS[currency] ?? currency + " ";
  const lang = locale === "tr" ? "tr-TR" : locale === "sr" ? "sr-RS" : locale === "sq" ? "sq-AL" : "en-US";
  const formatted = value.toLocaleString(lang, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return sym === "€" || sym === "£" || sym === "₺" ? `${formatted} ${sym}` : `${sym}${formatted}`;
}

function formatDueDate(dateStr: string | null, locale: string) {
  if (!dateStr) return "—";
  try {
    const lang = locale === "tr" ? "tr-TR" : locale === "sr" ? "sr-RS" : locale === "sq" ? "sq-AL" : "en-GB";
    return new Date(dateStr).toLocaleDateString(lang, { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "—";
  }
}

type Status = "paid" | "pending";

const iconBgClass: Record<Status, string> = {
  paid: "bg-[#134e4a]/10 text-[#134e4a]",
  pending: "bg-amber-100 text-amber-600",
};

interface MilestonesTableProps {
  installments?: PurchaseInstallmentWithProperty[];
}

function translateLabel(label: string | null, locale: string) {
  if (!label) return "—";
  if (locale !== "tr") return label;
  
  const mapping: Record<string, string> = {
    "Full Payment": "Tam Ödeme",
    "Down Payment": "Peşinat",
    "Installment": "Taksit",
  };

  for (const [en, tr] of Object.entries(mapping)) {
    if (label.toLowerCase().includes(en.toLowerCase())) {
      return label.replace(new RegExp(en, "gi"), tr);
    }
  }
  return label;
}

export function MilestonesTable({ installments = [] }: MilestonesTableProps) {
  const t = useTranslations("FinancialsPage.table");
  const locale = useLocale();
  const rows = installments.slice().sort((a, b) => a.sequence - b.sequence);

  const statusConfig: Record<
    Status,
    { label: string; className: string; dotClass: string }
  > = {
    paid: {
      label: t("statuses.paid"),
      className: "bg-emerald-100 text-emerald-700",
      dotClass: "bg-emerald-600",
    },
    pending: {
      label: t("statuses.pending"),
      className: "bg-amber-100 text-amber-700",
      dotClass: "bg-amber-500",
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up" style={{ animationDelay: "100ms" }}>
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">
          {t("title")}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200">
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">
                {t("payment")}
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t("dueDate")}
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t("amount")}
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t("status")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500 text-sm">
                  {t("empty")}
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const status: Status = row.paid_at ? "paid" : "pending";
                const config = statusConfig[status];
                const subtitle = [row.building_name, row.block, row.unit].filter(Boolean).join(" · ") || "—";
                return (
                  <tr key={row.id} className="hover:bg-gray-50/80">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-xl ${iconBgClass[status]}`}
                        >
                          <i className="las la-euro-sign text-xl" aria-hidden />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {translateLabel(row.label, locale)}
                          </p>
                          <p className="text-xs text-gray-500">{subtitle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-500">
                      {formatDueDate(row.due_date, locale)}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      {formatAmount(Number(row.amount), row.currency, locale)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.className}`}
                      >
<span
                        className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`}
                        />
                        {config.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
