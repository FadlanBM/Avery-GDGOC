"use client";

import { MetricCard } from "@/components/metric-card";
import { Skeleton } from "@/components/ui/skeleton";
import { AnalyticsMetrics } from "../types";
import {
  Users,
  Briefcase,
  Clock,
  UserCheck,
  Target,
  TrendingUp,
} from "lucide-react";

interface MetricsOverviewProps {
  data: AnalyticsMetrics;
  isLoading?: boolean;
}

export function MetricsOverview({ data, isLoading }: MetricsOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  // Calculate percentage changes vs previous period
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const applicationsChange = calculateChange(
    data.totalApplications,
    data.totalApplicationsPrevious
  );

  const activeJobsChange = calculateChange(
    data.activeJobs,
    data.activeJobsPrevious
  );

  const hiredChange = calculateChange(
    data.hiredCount,
    data.hiredCountPrevious
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <MetricCard
        icon={Users}
        iconColor="text-blue-600"
        iconBgColor="bg-blue-100"
        label="Total Applications"
        value={data.totalApplications.toString()}
        trend={{
          direction: applicationsChange >= 0 ? "up" : "down",
          value: `${Math.abs(applicationsChange)}%`,
        }}
      />

      <MetricCard
        icon={Briefcase}
        iconColor="text-purple-600"
        iconBgColor="bg-purple-100"
        label="Active Jobs"
        value={data.activeJobs.toString()}
        trend={{
          direction: activeJobsChange >= 0 ? "up" : "down",
          value: `${Math.abs(activeJobsChange)}%`,
        }}
      />

      <MetricCard
        icon={Clock}
        iconColor="text-orange-600"
        iconBgColor="bg-orange-100"
        label="Avg. Time to Hire"
        value={`${data.avgTimeToHire}d`}
        trend={{
          direction: data.avgTimeToHire < 30 ? "up" : "down",
          value: "days",
        }}
      />

      <MetricCard
        icon={UserCheck}
        iconColor="text-green-600"
        iconBgColor="bg-green-100"
        label="Hired This Period"
        value={data.hiredCount.toString()}
        trend={{
          direction: hiredChange >= 0 ? "up" : "down",
          value: `${Math.abs(hiredChange)}%`,
        }}
      />

      <MetricCard
        icon={Target}
        iconColor="text-pink-600"
        iconBgColor="bg-pink-100"
        label="Avg. Match Score"
        value={`${data.avgMatchScore}%`}
        trend={{
          direction: data.avgMatchScore >= 70 ? "up" : "down",
          value: "quality",
        }}
      />

      <MetricCard
        icon={TrendingUp}
        iconColor="text-indigo-600"
        iconBgColor="bg-indigo-100"
        label="Success Rate"
        value={`${data.successRate}%`}
        trend={{
          direction: data.successRate >= 10 ? "up" : "down",
          value: "conversion",
        }}
      />
    </div>
  );
}
