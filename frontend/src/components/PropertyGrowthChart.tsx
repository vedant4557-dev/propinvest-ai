"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PropertyGrowthChartProps {
  purchasePrice: number;
  futureValue: number;
  holdingPeriodYears: number;
  appreciationRate: number;
}

export function PropertyGrowthChart({
  purchasePrice,
  futureValue,
  holdingPeriodYears,
  appreciationRate,
}: PropertyGrowthChartProps) {
  const data = [];
  for (let year = 0; year <= holdingPeriodYears; year++) {
    const value = purchasePrice * Math.pow(1 + appreciationRate / 100, year);
    data.push({ year, value, label: `Year ${year}` });
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 10, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis
            dataKey="year"
            stroke="#94a3b8"
            tickFormatter={(v) => `Y${v}`}
          />
          <YAxis
            tickFormatter={(v) => `₹${(v / 1000000).toFixed(1)}Cr`}
            stroke="#94a3b8"
          />
          <Tooltip
            formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Value"]}
            labelFormatter={(label) => `Year ${label}`}
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "8px",
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#0ea5e9"
            strokeWidth={2}
            dot={{ fill: "#0ea5e9", r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
