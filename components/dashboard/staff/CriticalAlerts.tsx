"use client";

const ALERTS = [
  {
    id: "1",
    type: "pending" as const,
    title: "Foundation Phase 2 - Skyline",
    detail: "OVERDUE 24H",
    detailClass: "text-red-600",
    icon: "las la-exclamation-triangle",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  {
    id: "2",
    type: "delay" as const,
    title: "Cement batch ID: #29402",
    detail: "DELAYED 3 DAYS",
    detailClass: "text-amber-600",
    icon: "las la-clock",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    id: "3",
    type: "inspection" as const,
    title: "Safety Audit - Zone B",
    detail: "SCHEDULED 09:00 AM",
    detailClass: "text-blue-600",
    icon: "las la-clipboard-check",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: "4",
    type: "permit" as const,
    title: "Water Usage Permit - Site A",
    detail: "12 DAYS LEFT",
    detailClass: "text-gray-600",
    icon: "las la-file-alt",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
  },
];

export function CriticalAlerts() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Critical Alerts</h3>
        <span className="flex items-center justify-center size-6 rounded-full bg-red-500 text-white text-xs font-bold">
          {ALERTS.length}
        </span>
      </div>
      <ul className="flex-1 overflow-auto divide-y divide-gray-100">
        {ALERTS.map((alert) => (
          <li key={alert.id} className="px-6 py-4 hover:bg-gray-50/80 transition-colors">
            <div className="flex gap-3">
              <div
                className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${alert.iconBg} ${alert.iconColor}`}
              >
                <i className={`las ${alert.icon} text-lg`} aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">{alert.title}</p>
                <p className={`text-xs font-semibold mt-0.5 ${alert.detailClass}`}>
                  {alert.detail}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="p-4 border-t border-gray-100">
        <button
          type="button"
          className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Clear All Alerts
        </button>
      </div>
    </div>
  );
}
