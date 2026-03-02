"use client";

type Status = "paid" | "pending" | "overdue";

interface MilestoneRow {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  dueDate: string;
  amount: string;
  status: Status;
  isOverdue?: boolean;
}

const rows: MilestoneRow[] = [
  {
    id: "1",
    icon: "las la-euro-sign",
    title: "1st Payment",
    subtitle: "Down payment",
    dueDate: "Jan 15, 2024",
    amount: "200.000€",
    status: "paid",
  },
  {
    id: "2",
    icon: "las la-euro-sign",
    title: "Advance 25.000€ payment",
    subtitle: "Interim payment",
    dueDate: "Mar 01, 2024",
    amount: "25.000€",
    status: "paid",
  },
  {
    id: "3",
    icon: "las la-euro-sign",
    title: "2nd Payment",
    subtitle: "Second installment",
    dueDate: "May 15, 2024",
    amount: "250.000€",
    status: "overdue",
    isOverdue: true,
  },
  {
    id: "4",
    icon: "las la-euro-sign",
    title: "3rd Payment",
    subtitle: "Third installment",
    dueDate: "Aug 01, 2024",
    amount: "150.000€",
    status: "pending",
  },
];

const statusConfig: Record<
  Status,
  { label: string; className: string; dotClass: string }
> = {
  paid: {
    label: "Paid",
    className: "bg-emerald-100 text-emerald-700",
    dotClass: "bg-emerald-600",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700",
    dotClass: "bg-amber-500",
  },
  overdue: {
    label: "Overdue",
    className: "bg-red-100 text-red-700",
    dotClass: "bg-red-600",
  },
};

const iconBgClass: Record<Status, string> = {
  paid: "bg-[#134e4a]/10 text-[#134e4a]",
  pending: "bg-amber-100 text-amber-600",
  overdue: "bg-red-100 text-red-600",
};

export function MilestonesTable() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up" style={{ animationDelay: "100ms" }}>
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">
          Payments
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
            aria-label="Sort"
          >
            <i className="las la-sort text-xl" aria-hidden />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200">
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">
                Payment
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                Invoice
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map((row, i) => {
              const status = statusConfig[row.status] ?? statusConfig.pending;
              const isOverdueRow = row.isOverdue;
              return (
                <tr
                  key={row.id}
                  className={`group transition-colors ${
                    isOverdueRow
                      ? "bg-red-50/30 hover:bg-red-50/50"
                      : "hover:bg-gray-50/80"
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl ${iconBgClass[row.status] ?? iconBgClass.pending}`}
                      >
                        <i className={`${row.icon} text-xl`} aria-hidden />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {row.title}
                        </p>
                        <p className="text-xs text-gray-500">{row.subtitle}</p>
                      </div>
                    </div>
                  </td>
                  <td
                    className={`px-6 py-4 text-sm font-medium ${
                      isOverdueRow ? "text-red-600" : "text-gray-500"
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
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`}
                      />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      className="text-[#134e4a] hover:text-[#115e59] text-sm font-medium inline-flex items-center gap-1 transition-colors"
                    >
                      <i className="las la-download text-lg" aria-hidden />
                      PDF
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {row.status === "paid" ? (
                      <span className="text-gray-400 text-sm font-medium cursor-default">
                        Receipt Sent
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="inline-flex items-center justify-center px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
                      >
                        Pay Now
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-gray-200 bg-gray-50/50 flex justify-center">
        <button
          type="button"
          className="text-gray-500 text-sm font-medium hover:text-[#134e4a] flex items-center gap-1 transition-colors"
        >
          Show All Transactions
          <i className="las la-chevron-down text-base" aria-hidden />
        </button>
      </div>
    </div>
  );
}
