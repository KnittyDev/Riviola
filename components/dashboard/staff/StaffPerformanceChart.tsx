"use client";

import {
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
import { useTranslations, useLocale } from "next-intl";

const PRIMARY = "#134e4a";

export type StaffPerformancePoint = {
  label: string;
  value: number;
};

type StaffPerformanceChartProps = {
  /** Aggregated value per building (or similar) */
  data?: StaffPerformancePoint[];
};

const FALLBACK_DATA: StaffPerformancePoint[] = [
  { label: "Project A", value: 2_500_000 },
  { label: "Project B", value: 1_800_000 },
  { label: "Project C", value: 1_200_000 },
  { label: "Project D", value: 900_000 },
];

function formatEuro(value: number) {
  if (value >= 1_000_000) {
    return `€${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `€${(value / 1_000).toFixed(1)}k`;
  }
  return `€${value.toFixed(0)}`;
}

export function StaffPerformanceChart({ data }: StaffPerformanceChartProps) {
  const t = useTranslations("Staff.chart");
  const chartData = data && data.length > 0 ? data : FALLBACK_DATA;
  const totalValue = chartData.reduce((sum, d) => sum + d.value, 0);
  const maxValue = chartData.reduce((max, d) => (d.value > max ? d.value : max), 0) || 1;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">{t("title")}</h3>
        <p className="text-2xl font-extrabold text-gray-900 mt-1">
          {formatEuro(totalValue)}
        </p>
      </div>
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
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
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }}
              dy={8}
            />
            <YAxis
              hide
              domain={[0, maxValue * 1.1]}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const point = payload[0];
                return (
                  <div className="bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-lg">
                    <p className="text-sm font-bold text-gray-900 mb-2">{label}</p>
                    {point && (
                      <p className="text-sm text-gray-700">
                        {t("totalValue")}: {formatEuro(Number(point.value))}
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
                    {t("portfolioValue")}
                  </span>
                </div>
              )}
            />
            <Area
              type="monotone"
              dataKey="value"
              fill="url(#staffActualFill)"
              stroke="none"
              legendType="none"
            />
            <Line
              type="monotone"
              dataKey="value"
              name={t("portfolioValue")}
              stroke={PRIMARY}
              strokeWidth={2.5}
              strokeLinecap="round"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
