"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApplicationTrends } from "../types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ApplicationTrendChartProps {
  data: ApplicationTrends;
  isLoading?: boolean;
}

export function ApplicationTrendChart({
  data,
  isLoading,
}: ApplicationTrendChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Application Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Merge current and previous data by aligning them
  const currentMap = new Map(data.current.map((d) => [d.date, d.count]));
  const previousMap = new Map(data.previous.map((d) => [d.date, d.count]));

  // Get all unique dates from current period
  const allDates = Array.from(
    new Set([...data.current.map((d) => d.date)])
  ).sort();

  const chartData = allDates.map((date) => ({
    date: new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    current: currentMap.get(date) || 0,
  }));

  // Add previous period data (offset by the period length)
  const previousDates = Array.from(
    new Set([...data.previous.map((d) => d.date)])
  ).sort();

  const previousChartData = previousDates.map((date, index) => ({
    date: chartData[index]?.date || new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    previous: previousMap.get(date) || 0,
  }));

  // Merge both datasets
  const mergedData = chartData.map((item, index) => ({
    ...item,
    previous: previousChartData[index]?.previous || 0,
  }));

  return (
    <Card className="h-full ">
      <CardHeader>
        <CardTitle>Application Trends</CardTitle>
        <p className="text-sm text-muted-foreground">
          Daily application volume comparison
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mergedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: "hsl(var(--foreground))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: "20px",
              }}
            />
            <Line
              type="monotone"
              dataKey="current"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--chart-1))", r: 4 }}
              activeDot={{ r: 6 }}
              name="Current Period"
            />
            <Line
              type="monotone"
              dataKey="previous"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: "hsl(var(--chart-2))", r: 4 }}
              activeDot={{ r: 6 }}
              name="Previous Period"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
