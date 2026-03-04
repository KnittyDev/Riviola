"use client";

import { useMemo, useState } from "react";
import { aidatPayments, type AidatPayment, type AidatPaymentStatus } from "@/lib/staffAidatPaymentsData";

const STATUS_STYLES: Record<AidatPaymentStatus, { className: string }> = {
  Paid: { className: "bg-emerald-100 text-emerald-700" },
  Pending: { className: "bg-amber-100 text-amber-700" },
  Failed: { className: "bg-red-100 text-red-700" },
  Refunded: { className: "bg-gray-100 text-gray-700" },
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${date} · ${time}`;
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function exportRowsToPrintPdf({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: Array<{
    investorName: string;
    investorEmail: string;
    buildingName: string;
    unitLabel: string;
    period: string;
    paidAt: string;
    amount: string;
    status: string;
    reference: string;
    method: string;
  }>;
}) {
  const win = window.open("", "_blank", "noopener,noreferrer");
  if (!win) return;

  const now = new Date().toLocaleString("en-GB", { hour12: false });
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      * { box-sizing: border-box; }
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #111827; padding: 28px; }
      h1 { margin: 0; font-size: 18px; letter-spacing: -0.01em; }
      .sub { margin-top: 6px; color: #6B7280; font-size: 12px; }
      .meta { margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap; color: #6B7280; font-size: 11px; }
      .pill { display: inline-flex; align-items: center; padding: 6px 10px; border-radius: 999px; border: 1px solid #E5E7EB; }
      table { width: 100%; border-collapse: collapse; margin-top: 18px; }
      th, td { border-bottom: 1px solid #E5E7EB; padding: 10px 8px; vertical-align: top; }
      th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #6B7280; background: #F9FAFB; }
      td { font-size: 12px; }
      .muted { color: #6B7280; font-size: 11px; margin-top: 2px; }
      .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; color: #6B7280; }
      @media print {
        body { padding: 0; }
        .no-print { display: none !important; }
        th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    </style>
  </head>
  <body>
    <div class="no-print" style="display:flex; justify-content:flex-end; gap:10px; margin-bottom:14px;">
      <button onclick="window.print()" style="padding:10px 12px; border-radius:10px; border:1px solid #E5E7EB; background:#ffffff; font-weight:600; cursor:pointer;">Print / Save as PDF</button>
      <button onclick="window.close()" style="padding:10px 12px; border-radius:10px; border:1px solid #E5E7EB; background:#ffffff; font-weight:600; cursor:pointer;">Close</button>
    </div>

    <h1>${escapeHtml(title)}</h1>
    <div class="sub">${escapeHtml(subtitle)}</div>
    <div class="meta">
      <span class="pill">Generated: ${escapeHtml(now)}</span>
      <span class="pill">Rows: ${rows.length}</span>
    </div>

    <table>
      <thead>
        <tr>
          <th>Investor</th>
          <th>Building / Unit</th>
          <th>Period</th>
          <th>Paid at</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Reference</th>
        </tr>
      </thead>
      <tbody>
        ${rows
      .map(
        (r) => `
          <tr>
            <td>
              <div><strong>${escapeHtml(r.investorName)}</strong></div>
              <div class="muted">${escapeHtml(r.investorEmail)}</div>
            </td>
            <td>
              <div><strong>${escapeHtml(r.buildingName)}</strong></div>
              <div class="muted">${escapeHtml(r.unitLabel)}</div>
            </td>
            <td>${escapeHtml(r.period)}</td>
            <td>${escapeHtml(r.paidAt)}</td>
            <td><strong>${escapeHtml(r.amount)}</strong></td>
            <td>${escapeHtml(r.status)}</td>
            <td>
              <div class="mono">${escapeHtml(r.reference)}</div>
              <div class="muted">${escapeHtml(r.method)}</div>
            </td>
          </tr>
        `
      )
      .join("")}
      </tbody>
    </table>
  </body>
</html>`;

  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
}

export default function StaffAidatPaymentsPage() {
  const [status, setStatus] = useState<AidatPaymentStatus | "All">("All");
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState<string | "All">("All");
  const [includeAllDues, setIncludeAllDues] = useState(true);

  const periodOptions = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of aidatPayments) {
      const t = +new Date(p.paidAt);
      const prev = map.get(p.period);
      if (!prev || t > prev) map.set(p.period, t);
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([p]) => p);
  }, []);

  const roster = useMemo(() => {
    const map = new Map<string, { buildingId: string; buildingName: string; unitLabel: string; investorName: string; investorEmail: string }>();
    for (const p of aidatPayments) {
      const key = `${p.buildingId}||${p.unitLabel}||${p.investorEmail}`;
      if (!map.has(key)) {
        map.set(key, {
          buildingId: p.buildingId,
          buildingName: p.buildingName,
          unitLabel: p.unitLabel,
          investorName: p.investorName,
          investorEmail: p.investorEmail,
        });
      }
    }
    return [...map.values()];
  }, []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matchQuery = (p: { investorName: string; investorEmail: string; buildingName: string; unitLabel: string; reference: string; period: string }) => {
      if (!q) return true;
      return (
        p.investorName.toLowerCase().includes(q) ||
        p.investorEmail.toLowerCase().includes(q) ||
        p.buildingName.toLowerCase().includes(q) ||
        p.unitLabel.toLowerCase().includes(q) ||
        p.reference.toLowerCase().includes(q) ||
        p.period.toLowerCase().includes(q)
      );
    };

    if (includeAllDues && period !== "All") {
      const defaultAmount = "€ 45";
      const items = roster.map((r) => {
        const existing = aidatPayments.find(
          (p) => p.period === period && p.investorEmail === r.investorEmail && p.unitLabel === r.unitLabel && p.buildingId === r.buildingId
        );
        return (
          existing ?? {
            id: `due_${r.buildingId}_${r.unitLabel}_${r.investorEmail}_${period}`,
            buildingId: r.buildingId,
            buildingName: r.buildingName,
            unitLabel: r.unitLabel,
            investorName: r.investorName,
            investorEmail: r.investorEmail,
            period,
            amount: defaultAmount,
            currency: "EUR" as const,
            status: "Pending" as const,
            paidAt: new Date().toISOString(),
            method: "Card" as const,
            reference: `DUES-${period.replaceAll(" ", "")}-${r.buildingId}`,
          } satisfies AidatPayment
        );
      });

      return items
        .sort((a, b) => a.investorName.localeCompare(b.investorName))
        .filter((p) => (status === "All" ? true : p.status === status))
        .filter((p) => matchQuery(p));
    }

    return [...aidatPayments]
      .filter((p) => (period === "All" ? true : p.period === period))
      .sort((a, b) => +new Date(b.paidAt) - +new Date(a.paidAt))
      .filter((p) => (status === "All" ? true : p.status === status))
      .filter((p) => matchQuery(p));
  }, [status, query, period, includeAllDues, roster]);

  const totalPaid = useMemo(() => {
    const paid = aidatPayments.filter((p) => p.status === "Paid");
    const sum = paid.reduce((acc, p) => acc + (parseFloat(p.amount.replace(/[^\\d.]/g, "")) || 0), 0);
    return sum;
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Latest Dues payments
        </h1>
        <p className="text-gray-500 mt-1">
          Track incoming common charges (aidat) payments from investors.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm animate-fade-in-up">
          <p className="text-sm font-medium text-gray-500 mb-1">Total paid</p>
          <p className="text-2xl font-bold text-gray-900">€ {totalPaid.toLocaleString("en-GB", { minimumFractionDigits: 0 })}</p>
          <p className="text-xs text-gray-500 mt-1">All time (demo data)</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm animate-fade-in-up delay-100">
          <p className="text-sm font-medium text-gray-500 mb-1">Payments</p>
          <p className="text-2xl font-bold text-gray-900">{aidatPayments.length}</p>
          <p className="text-xs text-gray-500 mt-1">Most recent first</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm animate-fade-in-up delay-150">
          <p className="text-sm font-medium text-gray-500 mb-1">Needs attention</p>
          <p className="text-2xl font-bold text-red-600">
            {aidatPayments.filter((p) => p.status === "Failed").length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Failed payments</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex rounded-xl border border-gray-200 bg-white p-1">
          {(["All", "Paid", "Pending", "Failed", "Refunded"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s as any)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${status === s ? "bg-[#134e4a] text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              {s}
            </button>
          ))}
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none"
        >
          <option value="All">All months</option>
          {periodOptions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <label className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700">
          <input
            type="checkbox"
            checked={includeAllDues}
            onChange={(e) => setIncludeAllDues(e.target.checked)}
            className="rounded border-gray-300 text-[#134e4a] focus:ring-[#134e4a]"
          />
          Include all dues
        </label>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search investor, building, unit, reference…"
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">
            {includeAllDues && period !== "All" ? `Dues report — ${period}` : "Incoming payments"}
          </h3>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                exportRowsToPrintPdf({
                  title: includeAllDues && period !== "All" ? `Dues report — ${period}` : "Dues payments",
                  subtitle:
                    includeAllDues && period !== "All"
                      ? "All dues (paid + pending/failed/refunded) for the selected month."
                      : "Incoming payments list.",
                  rows: rows.map((p) => ({
                    investorName: p.investorName,
                    investorEmail: p.investorEmail,
                    buildingName: p.buildingName,
                    unitLabel: p.unitLabel,
                    period: p.period,
                    paidAt: formatDateTime(p.paidAt),
                    amount: p.amount,
                    status: p.status,
                    reference: p.reference,
                    method: p.method,
                  })),
                })
              }
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              <i className="las la-file-pdf text-base" aria-hidden /> Export PDF
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Investor
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Building / Unit
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Paid at
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Reference
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rows.map((p: AidatPayment) => (
                <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900">{p.investorName}</p>
                    <p className="text-xs text-gray-500">{p.investorEmail}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-900">{p.buildingName}</p>
                    <p className="text-xs text-gray-500">{p.unitLabel}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.period}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDateTime(p.paidAt)}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{p.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[p.status].className}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs font-mono text-gray-500">{p.reference}</span>
                    <p className="text-[11px] text-gray-400 mt-1">{p.method}</p>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="px-6 py-10 text-center text-sm text-gray-500" colSpan={7}>
                    No payments match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

