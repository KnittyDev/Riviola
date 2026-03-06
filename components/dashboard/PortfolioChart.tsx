"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const PRIMARY_COLOR = "#134e4a";

function formatEuro(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value) + "€";
}

export type PaidDuesChartPoint = { month: string; value: number };

type PortfolioChartProps = {
  investorType: "buyer" | "renter";
  assetValueFormatted: string;
  paidAmountFormatted: string;
  assetValueNumber: number;
  paidAmountNumber: number;
  paidDuesChartData?: PaidDuesChartPoint[];
};

export function PortfolioChart({
  investorType,
  assetValueFormatted,
  paidAmountFormatted,
  assetValueNumber,
  paidAmountNumber,
  paidDuesChartData = [],
}: PortfolioChartProps) {
  const isBuyer = investorType === "buyer";
  const title = isBuyer ? "Asset Value" : "Payments Made";
  const displayValue = isBuyer ? assetValueFormatted : paidAmountFormatted;
  const currentValue = isBuyer ? assetValueNumber : paidAmountNumber;

  const data = useMemo(() => {
    if (isBuyer) {
      if (currentValue <= 0) return [{ month: "—", value: 0 }];
      return [
        { month: "—", value: 0 },
        { month: "Current", value: currentValue },
      ];
    }
    if (paidDuesChartData.length > 0) return paidDuesChartData;
    if (currentValue <= 0) return [{ month: "—", value: 0 }];
    return [
      { month: "—", value: 0 },
      { month: "Current", value: currentValue },
    ];
  }, [isBuyer, currentValue, paidDuesChartData]);

  const maxChartValue = useMemo(() => {
    if (data.length === 0) return 1;
    const max = Math.max(...data.map((d) => d.value));
    return max <= 0 ? 1 : max * 1.1;
  }, [data]);

  const tooltipLabel = isBuyer ? "Value" : "Paid";

  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-gray-500 text-sm font-medium">
            {title}
          </p>
          <h3 className="text-3xl font-bold mt-1 text-gray-900">
            {displayValue === "—" ? "—" : displayValue}
          </h3>
          {isBuyer ? (
            <p className="text-gray-400 text-sm mt-1">Total value of your properties</p>
          ) : (
            <p className="text-gray-400 text-sm mt-1">Total dues paid to date</p>
          )}
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
              domain={[0, maxChartValue]}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value?: number) => [value != null && value > 0 ? formatEuro(value) : "—", tooltipLabel]}
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
