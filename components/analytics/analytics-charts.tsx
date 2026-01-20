"use client"; // <--- This is the magic key

import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

interface AnalyticsChartsProps {
  data: {
    name: string;
    Estimated: number | null;
    Actual: number | null;
  }[];
}

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  return (
    <div className="h-[300px] w-full">
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#333", border: "none" }}
              itemStyle={{ color: "#fff" }}
            />
            <Bar dataKey="Estimated" fill="#8884d8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Actual" fill="#82ca9d" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          Not enough data. Complete some work orders to see efficiency charts.
        </div>
      )}
    </div>
  );
}