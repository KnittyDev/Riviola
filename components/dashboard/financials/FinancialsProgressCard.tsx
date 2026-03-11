"use client";

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

function formatAmount(value: number, currency: string): string {
  const sym = CURRENCY_SYMBOLS[currency] ?? currency + " ";
  return `${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}${sym === "€" || sym === "£" || sym === "₺" ? " " + sym : sym}`;
}

export type TotalByCurrency = Record<string, number>;

interface FinancialsProgressCardProps {
  totalByCurrency?: TotalByCurrency | null;
  paidByCurrency?: TotalByCurrency | null;
}

export function FinancialsProgressCard({
  totalByCurrency = {},
  paidByCurrency = {},
}: FinancialsProgressCardProps) {
  const safeTotal = totalByCurrency ?? {};
  const safePaid = paidByCurrency ?? {};

  const totalEntries = Object.entries(safeTotal).filter(([, v]) => v > 0);
  const totalContractDisplay =
    totalEntries.length === 0
      ? "—"
      : totalEntries.map(([c, v]) => formatAmount(v, c)).join(" · ");

  const primaryCurrency = totalEntries[0];
  const primaryTotal = primaryCurrency ? safeTotal[primaryCurrency[0]] ?? 0 : 0;
  const primaryPaid = primaryCurrency ? safePaid[primaryCurrency[0]] ?? 0 : 0;
  const progressPercent =
    primaryTotal > 0 ? Math.round((primaryPaid / primaryTotal) * 100) : 0;
  const paidPercent = Math.min(100, progressPercent);
  const remainingPercent = Math.max(0, 100 - paidPercent);

  const paidDisplay =
    totalEntries.length === 0
      ? "—"
      : totalEntries.map(([c]) => {
          const paid = safePaid[c] ?? 0;
          return formatAmount(paid, c);
        }).join(" · ");

  const remainingByCurrency: TotalByCurrency = {};
  for (const [c, total] of totalEntries) {
    const paid = safePaid[c] ?? 0;
    remainingByCurrency[c] = Math.max(0, total - paid);
  }
  const remainingDisplay =
    totalEntries.length === 0
      ? "—"
      : totalEntries.map(([c]) => formatAmount(remainingByCurrency[c] ?? 0, c)).join(" · ");

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 animate-fade-in-up">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">
                Total Progress
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">{progressPercent}%</span>
                <span className="text-sm text-gray-500">Paid</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {totalContractDisplay}
              </p>
            </div>
          </div>
          <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-[#134e4a] transition-all duration-700"
              style={{ width: `${paidPercent}%` }}
            />
            <div
              className="h-full bg-gray-200 transition-all duration-700"
              style={{ width: `${remainingPercent}%` }}
            />
          </div>
          <div className="flex gap-4 text-xs text-gray-500 mt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#134e4a]" /> Paid
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-200" /> Remaining
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="flex flex-col gap-1">
            <p className="text-gray-500 text-sm font-medium">
              Total Contract Value
            </p>
            <p className="text-gray-900 text-2xl font-bold tracking-tight">
              {totalContractDisplay}
            </p>
          </div>
          <div className="flex flex-col gap-1 md:border-l md:border-gray-200 md:pl-6">
            <p className="text-gray-500 text-sm font-medium">Paid to Date</p>
            <p className="text-emerald-600 text-2xl font-bold tracking-tight">
              {paidDisplay}
            </p>
          </div>
          <div className="flex flex-col gap-1 md:border-l md:border-gray-200 md:pl-6">
            <p className="text-gray-500 text-sm font-medium">
              Remaining Balance
            </p>
            <p className="text-gray-900 text-2xl font-bold tracking-tight">
              {remainingDisplay}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
