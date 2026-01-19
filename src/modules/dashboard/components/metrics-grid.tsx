import { MetricCard } from "@/components/metric-card";
import { Users, Calendar, Briefcase, Clock } from "lucide-react";

export function MetricsGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <MetricCard
        icon={Users}
        iconColor="text-blue-500"
        iconBgColor="bg-blue-50 dark:bg-blue-950"
        label="Total Applicants"
        value="1,240"
        trend={{ direction: "up", value: "+12% vs last month" }}
      />
      <MetricCard
        icon={Calendar}
        iconColor="text-green-500"
        iconBgColor="bg-green-50 dark:bg-green-950"
        label="Interviews Scheduled"
        value="28"
        trend={{ direction: "up", value: "+8 this week" }}
      />
      <MetricCard
        icon={Briefcase}
        iconColor="text-orange-500"
        iconBgColor="bg-orange-50 dark:bg-orange-950"
        label="Open Jobs"
        value="6"
        trend={{ direction: "up", value: "+2 new this month" }}
      />
      <MetricCard
        icon={Clock}
        iconColor="text-purple-500"
        iconBgColor="bg-purple-50 dark:bg-purple-950"
        label="Avg. Time to Hire"
        value="18 days"
        trend={{ direction: "down", value: "-3 days vs last quarter" }}
      />
    </div>
  );
}
