import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type TrendData = {
  period: string;
  value: number;
  value_ly: number;
};

type TrendChartProps = {
  data: TrendData[];
  title?: string;
};

const formatYAxis = (val: number) => {
  if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}B`;
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
  return val.toLocaleString();
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const cy = payload[0].value;
    const ly = payload[1]?.value;
    return (
      <div style={{ background: "rgba(255, 255, 255, 0.95)", border: "1px solid #e2e8f0", padding: "8px 12px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 700, color: "#64748b", marginBottom: 4 }}>{label}</p>
        <div style={{ display: "flex", gap: 12, fontSize: "0.8rem", fontWeight: 600 }}>
            <div style={{color: "#3b82f6"}}>CY: {formatYAxis(cy)}</div>
            {ly !== undefined && <div style={{color: "#94a3b8"}}>LY: {formatYAxis(ly)}</div>}
        </div>
      </div>
    );
  }
  return null;
};

export default function TrendChart({ data, title }: TrendChartProps) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      {title && (
        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {title}
        </div>
      )}

      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
                dataKey="period" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: "#64748b" }} 
                dy={10}
            />
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: "#64748b" }} 
                tickFormatter={formatYAxis}
            />
            <Tooltip content={<CustomTooltip />} cursor={{fill: "rgba(0,0,0,0.03)"}} />
            <Bar dataKey="value_ly" name="Last Year" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={12} />
            <Bar dataKey="value" name="Current Year" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={12} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}