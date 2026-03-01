const stats = [
  { icon: "las la-building", label: "Total Properties", value: "4" },
  { icon: "las la-hard-hat", label: "Under Construction", value: "2" },
  { icon: "las la-check-circle", label: "Completed", value: "1" },
  { icon: "las la-euro-sign", label: "Total Value", value: "3.24M€" },
];

export function PropertiesSummaryBar() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className="animate-fade-in-up bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="size-11 rounded-xl bg-[#134e4a]/10 flex items-center justify-center shrink-0">
            <i className={`${s.icon} text-[#134e4a] text-xl`} aria-hidden />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-0.5">{s.label}</p>
            <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
