import Link from "next/link";

export function DashboardHeader() {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-10">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
          My Residences
        </h2>
        <p className="text-gray-500 mt-1">
          Welcome back, your properties are appreciating on schedule.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          aria-label="Notifications"
        >
          <i className="las la-bell text-xl" aria-hidden />
        </button>
        <button
          type="button"
          className="bg-[#134e4a] text-white px-4 sm:px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-[#134e4a]/20 hover:bg-[#115e59] transition-colors"
        >
          <i className="las la-sign-out-alt text-lg" aria-hidden />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
