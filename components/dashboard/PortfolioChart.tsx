"use client";

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const PERIODS = ["1Y", "5Y", "ALL"] as const;

const PRIMARY_COLOR = "#134e4a";

// Sample data: portfolio value over time (1Y view – last 12 months)
const DATA_1Y = [
  { month: "OCT 23", value: 2487500 },
  { month: "NOV 23", value: 2521000 },
  { month: "DEC 23", value: 2558000 },
  { month: "JAN 24", value: 2594000 },
  { month: "FEB 24", value: 2622000 },
  { month: "MAR 24", value: 2668000 },
  { month: "APR 24", value: 2701000 },
  { month: "MAY 24", value: 2735000 },
  { month: "JUN 24", value: 2762000 },
  { month: "JUL 24", value: 2798000 },
  { month: "AUG 24", value: 2815000 },
  { month: "SEP 24", value: 2832000 },
  { month: "OCT 24", value: 2840500 },
];

const DATA_5Y = [
  { month: "OCT 20", value: 1200000 },
  { month: "OCT 21", value: 1480000 },
  { month: "OCT 22", value: 1920000 },
  { month: "OCT 23", value: 2487500 },
  { month: "OCT 24", value: 2840500 },
];

const DATA_ALL = [
  { month: "2020", value: 1200000 },
  { month: "2021", value: 1480000 },
  { month: "2022", value: 1920000 },
  { month: "2023", value: 2487500 },
  { month: "2024", value: 2840500 },
];

function formatEuro(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value) + "€";
}

export function PortfolioChart() {
  const [period, setPeriod] = useState<"1Y" | "5Y" | "ALL">("1Y");

  const data = useMemo(() => {
    switch (period) {
      case "5Y":
        return DATA_5Y;
      case "ALL":
        return DATA_ALL;
      default:
        return DATA_1Y;
    }
  }, [period]);

  const displayValue = "2.840.500€";

  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-gray-500 text-sm font-medium">
          The Asset Value
          </p>
          <h3 className="text-3xl font-bold mt-1 text-gray-900">
            {displayValue}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-emerald-600 text-sm font-bold flex items-center gap-0.5">
              <i className="las la-chart-line text-sm" aria-hidden />
              +14.2%
            </span>
            <span className="text-gray-400 text-sm">since last year</span>
          </div>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${
                period === p
                  ? "bg-white shadow-sm text-[#134e4a]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 24 }}
          >
            <defs>
              <linearGradient
                id="portfolioGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={PRIMARY_COLOR} stopOpacity={0.25} />
                <stop offset="100%" stopColor={PRIMARY_COLOR} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="0"
              stroke="#f1f5f9"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
              dy={8}
            />
            <YAxis
              hide
              domain={["dataMin - 100000", "dataMax + 50000"]}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value?: number) => [formatEuro(value ?? 0), "Value"]}
              labelStyle={{ fontWeight: 700, color: "#134e4a" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={PRIMARY_COLOR}
              strokeWidth={3}
              strokeLinecap="round"
              fill="url(#portfolioGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
