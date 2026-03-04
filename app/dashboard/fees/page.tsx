"use client";

import { useState } from "react";

type FeeStatus = "paid" | "due" | "overdue";

interface FeeItem {
  id: string;
  building: string;
  unit?: string;
  type: "aidat" | "electric" | "water" | "gas" | "insurance" | "other";
  description: string;
  period: string;
  dueDate: string;
  amount: string;
  status: FeeStatus;
}

const feeTypeLabels: Record<FeeItem["type"], string> = {
  aidat: "Common charges (Aidat)",
  electric: "Electricity",
  water: "Water",
  gas: "Gas",
  insurance: "Building insurance",
  other: "Other",
};

const initialFees: FeeItem[] = [
  {
    id: "1",
    building: "Sunrise Residences",
    unit: "Block A, Unit 12",
    type: "aidat",
    description: "Monthly common charges",
    period: "March 2025",
    dueDate: "Mar 10, 2025",
    amount: "€ 420",
    status: "due",
  },
  {
    id: "2",
    building: "Sunrise Residences",
    unit: "Block A, Unit 12",
    type: "electric",
    description: "Electricity – common areas",
    period: "Feb 2025",
    dueDate: "Mar 05, 2025",
    amount: "€ 85",
    status: "overdue",
  },
  {
    id: "3",
    building: "Sunrise Residences",
    unit: "Block A, Unit 12",
    type: "water",
    description: "Water & sewage",
    period: "March 2025",
    dueDate: "Mar 15, 2025",
    amount: "€ 45",
    status: "due",
  },
  {
    id: "4",
    building: "Sunrise Residences",
    unit: "Block A, Unit 12",
    type: "insurance",
    description: "Building insurance (annual)",
    period: "2025",
    dueDate: "Apr 01, 2025",
    amount: "€ 1.200",
    status: "due",
  },
  {
    id: "5",
    building: "Sunrise Residences",
    unit: "Block A, Unit 12",
    type: "aidat",
    description: "Monthly common charges",
    period: "February 2025",
    dueDate: "Feb 10, 2025",
    amount: "€ 420",
    status: "paid",
  },
];

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

export default function FeesPage() {
  const [fees, setFees] = useState<FeeItem[]>(initialFees);

  const totalDue = fees
    .filter((f) => f.status === "due" || f.status === "overdue")
    .reduce((sum, f) => sum + parseFloat(f.amount.replace(/[^\d.]/g, "")) || 0, 0);

  const handlePay = (id: string) => {
    setFees((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: "paid" as FeeStatus } : f))
    );
  };

  const canPay = (status: FeeStatus) => status === "due" || status === "overdue";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 animate-fade-in">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            Fees & Payments
          </h1>
          <p className="text-gray-500 text-base">
            Track and pay apartment and building fees — common charges (aidat), utilities, insurance and other expenses.
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm animate-fade-in-up">
          <p className="text-sm font-medium text-gray-500 mb-1">Total due</p>
          <p className="text-2xl font-bold text-gray-900">
            € {totalDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-amber-600 font-medium mt-1">
            {fees.filter((f) => f.status === "due" || f.status === "overdue").length} item(s) to pay
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm animate-fade-in-up delay-100">
          <p className="text-sm font-medium text-gray-500 mb-1">Paid this month</p>
          <p className="text-2xl font-bold text-emerald-600">€ 420</p>
          <p className="text-xs text-gray-500 mt-1">1 payment</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm animate-fade-in-up delay-150">
          <p className="text-sm font-medium text-gray-500 mb-1">Next due date</p>
          <p className="text-2xl font-bold text-gray-900">Mar 10, 2025</p>
          <p className="text-xs text-gray-500 mt-1">Common charges (Aidat)</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">
            All fees and expenses
          </h3>
          <div className="flex gap-2">
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-[#134e4a] transition-colors rounded-lg hover:bg-gray-50"
              aria-label="Filter"
            >
              <i className="las la-filter text-xl" aria-hidden />
            </button>
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-[#134e4a] transition-colors rounded-lg hover:bg-gray-50"
              aria-label="Export"
            >
              <i className="las la-download text-xl" aria-hidden />
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
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {fees.map((row) => {
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
                        {row.unit && (
                          <p className="text-xs text-gray-500">{row.unit}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {feeTypeLabels[row.type]}
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
                      {row.amount}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.className}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {canPay(row.status) ? (
                        <button
                          type="button"
                          onClick={() => handlePay(row.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#134e4a] text-white text-sm font-semibold hover:bg-[#115e59] transition-colors"
                        >
                          <i className="las la-credit-card text-base" aria-hidden />
                          Pay
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">Paid</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-sm text-gray-500 mt-6">
        Payments are processed securely. You can pay individual items or use &quot;Pay all due&quot; when available.
      </p>
    </div>
  );
}
