"use client";

const paidPercent = 65;
const pendingPercent = 15;
const remainingPercent = 100 - paidPercent - pendingPercent;

export function FinancialsProgressCard() {
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
                <span className="text-3xl font-bold text-gray-900">
                  {paidPercent}%
                </span>
                <span className="text-sm text-gray-500">Paid</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                650.000€{" "}
                <span className="text-gray-500 font-normal">of 1.000.000€</span>
              </p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-[#134e4a] transition-all duration-700"
              style={{ width: `${paidPercent}%` }}
            />
            <div
              className="h-full bg-amber-500 transition-all duration-700"
              style={{ width: `${pendingPercent}%` }}
            />
            <div
              className="h-full bg-gray-200 transition-all duration-700"
              style={{ width: `${remainingPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#134e4a]" /> Paid
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Pending
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gray-200" /> Remaining
              </span>
            </div>
            <span>Last updated: Oct 24, 2024</span>
          </div>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="flex flex-col gap-1">
            <p className="text-gray-500 text-sm font-medium">
              Total Contract Value
            </p>
            <p className="text-gray-900 text-2xl font-bold tracking-tight">
              1.000.000€
            </p>
          </div>
          <div className="flex flex-col gap-1 md:border-l md:border-gray-200 md:pl-6">
            <p className="text-gray-500 text-sm font-medium">Paid to Date</p>
            <p className="text-emerald-600 text-2xl font-bold tracking-tight">
              650.000€
            </p>
          </div>
          <div className="flex flex-col gap-1 md:border-l md:border-gray-200 md:pl-6">
            <p className="text-gray-500 text-sm font-medium">
              Remaining Balance
            </p>
            <p className="text-gray-900 text-2xl font-bold tracking-tight">
              350.000€
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
