import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type Props = {
  apiResult: any; // The full JSON object from your API
};

export default function VolumeChart({ apiResult }: Props) {
  // 1. Transform "Array of Arrays" into "Array of Objects"
  const chartData = useMemo(() => {
    if (!apiResult?.result?.data_array) return [];

    return apiResult.result.data_array.map((row: string[]) => {
      // row[0] = cal_yr_mo_nbr, row[1] = bbls_cy, row[2] = bbls_ly
      // We explicitly parse floats because API sends strings to preserve precision
      return {
        month: row[0], 
        "2025 Volume": parseFloat(row[1]),
        "2024 Volume": parseFloat(row[2]),
      };
    });
  }, [apiResult]);

  if (chartData.length === 0) {
    return <div className="p-4 text-gray-500">No data available</div>;
  }

  return (
    <div style={{ width: "100%", height: 400, marginTop: 20 }}>
      <h3 style={{ fontWeight: 700, marginBottom: 10 }}>Total Volume (BBLs)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="month" 
            tickFormatter={(val) => `${val.substring(4, 6)}/${val.substring(2, 4)}`} // Format 202501 -> 01/25
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} // Format 5000000 -> 5.0M
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value: number) => new Intl.NumberFormat('en-US').format(Math.round(value))}
            labelFormatter={(label) => `Month: ${label}`}
          />
          <Legend />
          <Bar dataKey="2025 Volume" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="2024 Volume" fill="#9ca3af" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}