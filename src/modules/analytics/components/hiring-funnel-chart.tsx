"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HiringFunnel } from "../types";

interface HiringFunnelChartProps {
  data: HiringFunnel;
  isLoading?: boolean;
}

const STAGE_COLORS = {
  applied: "#3b82f6",
  screening: "#3b82f6",
  interview: "#3b82f6",
  offer: "#3b82f6",
  hired: "#3b82f6",
};

const STAGE_LABELS = {
  applied: "Applications",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  hired: "Hired",
};

export function HiringFunnelChart({ data, isLoading }: HiringFunnelChartProps) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Hiring Funnel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Skeleton for each funnel stage */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-2.5 w-full rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const stages = [
    { key: "applied", label: STAGE_LABELS.applied, count: data.applied },
    { key: "screening", label: STAGE_LABELS.screening, count: data.screening },
    { key: "interview", label: STAGE_LABELS.interview, count: data.interview },
    { key: "offer", label: STAGE_LABELS.offer, count: data.offer },
    { key: "hired", label: STAGE_LABELS.hired, count: data.hired },
  ];

  const maxCount = data.applied || 1;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Hiring Funnel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stages.map((stage) => {
          const percentage = (stage.count / maxCount) * 100;
          
          return (
            <div key={stage.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{stage.label}</span>
                <span className="text-sm font-semibold text-gray-900">{stage.count.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-2.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: STAGE_COLORS[stage.key as keyof typeof STAGE_COLORS],
                  }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
