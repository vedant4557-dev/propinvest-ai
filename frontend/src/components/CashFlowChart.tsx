"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface CashFlowChartProps {
  annualCashFlow: number;
  emi: number;
  annualRent: number;
  annualMaintenance: number;
}

export function CashFlowChart({
  annualCashFlow,
  emi,
  annualRent,
  annualMaintenance,
}: CashFlowChartProps) {
  const annualEmi = emi * 12;
  const data = [
    { name: "Rent Income", value: annualRent, fill: "#10b981" },
    { name: "EMI Outflow", value: -annualEmi, fill: "#f43f5e" },
    { name: "Maintenance", value: -annualMaintenance, fill: "#f59e0b" },
    { name: "Net Cash Flow", value: annualCashFlow, fill: annualCashFlow >= 0 ? "#10b981" : "#f43f5e" },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis
            type="number"
            tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
            stroke="#94a3b8"
          />
          <YAxis type="category" dataKey="name" width={100} stroke="#94a3b8" />
          <Tooltip
            formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, ""]}
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "8px",
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
