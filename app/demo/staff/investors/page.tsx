import Link from "next/link";

export default function StaffInvestorsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Investors</h1>
        <Link
          href="/demo/staff/investors/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#134e4a] text-white text-sm font-semibold hover:bg-[#115e59] transition-colors"
        >
          <i className="las la-user-plus" aria-hidden />
          Create investor account
        </Link>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
        <i className="las la-users text-4xl text-gray-300 mb-4" aria-hidden />
        <p className="text-gray-500 font-medium">No investor accounts yet.</p>
        <p className="text-sm text-gray-400 mt-1 mb-6">When you create accounts for investors they will appear here.</p>
        <Link
          href="/demo/staff/investors/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#134e4a] text-white text-sm font-semibold hover:bg-[#115e59] transition-colors"
        >
          <i className="las la-plus" aria-hidden />
          Create investor account
        </Link>
      </div>
    </div>
  );
}
