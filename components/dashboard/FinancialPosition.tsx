export function FinancialPosition() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-full">
        <div>
          <h4 className="text-lg font-bold mb-6 text-gray-900">
            Financial Position
          </h4>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Total Invested</span>
              <span className="font-bold text-gray-900">1.450.000€</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Equity Earned</span>
              <span className="font-bold text-emerald-600">+1.390.500€</span>
            </div>
            <div className="pt-6 border-t border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                    Next Installment
                  </p>
                  <p className="text-2xl font-bold mt-1 text-gray-900">
                    12.400€
                  </p>
                </div>
                <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full">
                  DUE OCT 15
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 space-y-3">
          <button
            type="button"
            className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
          >
            <i className="las la-download text-lg" aria-hidden />
            Tax Documents (2024)
          </button>
          <button
            type="button"
            className="w-full bg-gray-100 text-gray-600 py-3.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
          >
            Manage Payment Methods
          </button>
        </div>
      </div>
    </div>
  );
}
