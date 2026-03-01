"use client";

interface Props {
  activeFilter: string;
  onFilterChange: (f: string) => void;
  search: string;
  onSearchChange: (v: string) => void;
  /** Geçici: true iken arama alanı gizlenir */
  searchDisabled?: boolean;
}

const FILTERS = [
  { key: "all", label: "All Properties" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "planning", label: "Planning" },
];

export function PropertiesFilterBar({
  activeFilter,
  onFilterChange,
  search,
  onSearchChange,
  searchDisabled = true,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in">
      {/* Filter tabs */}
      <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => onFilterChange(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeFilter === f.key
                ? "bg-[#134e4a] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Search – geçici olarak devre dışı (searchDisabled=false yaparak tekrar açılabilir) */}
      {!searchDisabled && (
        <div className="relative flex-1 max-w-xs">
          <i
            className="las la-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg"
            aria-hidden
          />
          <input
            type="text"
            placeholder="Search properties…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#134e4a]/30 focus:border-[#134e4a] transition-all"
          />
        </div>
      )}
    </div>
  );
}
