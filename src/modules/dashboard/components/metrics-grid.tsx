import { MetricCard } from "@/components/metric-card";
import { Users, Calendar, Briefcase, Clock } from "lucide-react";
import { MetricsGridSkeleton } from "./metrics-skeleton";
import { DashboardMetrics } from "../types";

interface MetricsGridProps {
  metrics?: DashboardMetrics;
  isLoading?: boolean;
}

export function MetricsGrid({ metrics, isLoading }: MetricsGridProps) {
  if (isLoading || !metrics) {
    return <MetricsGridSkeleton />;
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 lg:mb-8">
      <MetricCard
        icon={Users}
        iconColor="text-blue-500"
        iconBgColor="bg-blue-50 dark:bg-blue-950"
        label="Total Applicants"
        value={metrics.totalApplicants.toLocaleString()}
        trend={{
          direction: metrics.applicantsTrend >= 0 ? "up" : "down",
          value: `${metrics.applicantsTrend >= 0 ? "+" : ""}${metrics.applicantsTrend}% vs last month`,
        }}
      />
      <MetricCard
        icon={Calendar}
        iconColor="text-green-500"
        iconBgColor="bg-green-50 dark:bg-green-950"
        label="Interviews Scheduled"
        value={metrics.interviewsScheduled.toString()}
        trend={{
          direction: metrics.interviewsTrend >= 0 ? "up" : "down",
          value: `${metrics.interviewsTrend >= 0 ? "+" : ""}${metrics.interviewsTrend} this week`,
        }}
      />
      <MetricCard
        icon={Briefcase}
        iconColor="text-orange-500"
        iconBgColor="bg-orange-50 dark:bg-orange-950"
        label="Open Jobs"
        value={metrics.openJobs.toString()}
        trend={{
          direction: metrics.jobsTrend >= 0 ? "up" : "down",
          value: `${metrics.jobsTrend >= 0 ? "+" : ""}${metrics.jobsTrend} new this month`,
        }}
      />
      <MetricCard
        icon={Clock}
        iconColor="text-purple-500"
        iconBgColor="bg-purple-50 dark:bg-purple-950"
        label="Avg. Time to Hire"
        value={`${metrics.avgTimeToHire} days`}
        trend={{
          direction: metrics.timeToHireTrend <= 0 ? "down" : "up",
          value: `${metrics.timeToHireTrend} days vs last quarter`,
        }}
      />
    </div>
  );
}
