"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Area,
  ComposedChart,
} from "recharts";

const PRIMARY = "#134e4a";
const PROJECTED = "#cbd5e1";

const DATA = [
  { month: "JAN", actual: 128, projected: 125 },
  { month: "FEB", actual: 131, projected: 130 },
  { month: "MAR", actual: 133, projected: 132 },
  { month: "APR", actual: 136, projected: 135 },
  { month: "MAY", actual: 138, projected: 138 },
  { month: "JUN", actual: 139, projected: 140 },
  { month: "JUL", actual: 141, projected: 142 },
  { month: "AUG", actual: 142, projected: 143 },
  { month: "SEP", actual: 142.5, projected: 144 },
  { month: "OCT", actual: 142.8, projected: 145 },
];

function formatValue(value: number) {
  return `€${value.toFixed(1)}M`;
}

export function StaffPerformanceChart() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">Portfolio Performance</h3>
        <p className="text-2xl font-extrabold text-gray-900 mt-1">
          {formatValue(142.8)}
        </p>
        <p className="text-sm text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
          <i className="las la-arrow-up" aria-hidden />
          4.2%
        </p>
      </div>
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={DATA}
            margin={{ top: 8, right: 8, left: 0, bottom: 20 }}
          >
            <defs>
              <linearGradient id="staffActualFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.2} />
                <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="0" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }}
              dy={8}
            />
            <YAxis
              hide
              domain={[120, 150]}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const byKey = new Map(payload.map((p) => [p.dataKey, p]));
                const actual = byKey.get("actual");
                const projected = byKey.get("projected");
                return (
                  <div className="bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-lg">
                    <p className="text-sm font-bold text-gray-900 mb-2">{label}</p>
                    {actual && (
                      <p className="text-sm text-gray-700">
                        Actual : {formatValue(Number(actual.value))}
                      </p>
                    )}
                    {projected && (
                      <p className="text-sm text-gray-700">
                        Projected : {formatValue(Number(projected.value))}
                      </p>
                    )}
                  </div>
                );
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              content={() => (
                <div className="flex items-center justify-end gap-4 text-xs font-semibold text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="inline-block size-2 rounded-full"
                      style={{ backgroundColor: PRIMARY }}
                    />
                    Actual
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="inline-block size-2 rounded-full"
                      style={{ backgroundColor: PROJECTED }}
                    />
                    Projected
                  </span>
                </div>
              )}
            />
            <Area
              type="monotone"
              dataKey="actual"
              fill="url(#staffActualFill)"
              stroke="none"
              legendType="none"
            />
            <Line
              type="monotone"
              dataKey="actual"
              name="Actual"
              stroke={PRIMARY}
              strokeWidth={2.5}
              strokeLinecap="round"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="projected"
              name="Projected"
              stroke={PROJECTED}
              strokeWidth={1.5}
              strokeDasharray="4 4"
              strokeLinecap="round"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
