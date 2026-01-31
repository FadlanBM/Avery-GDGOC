export interface DashboardMetrics {
    totalApplicants: number;
    interviewsScheduled: number;
    openJobs: number;
    avgTimeToHire: number;
    // Trend data
    applicantsTrend: number; // percentage change vs last period
    interviewsTrend: number;
    jobsTrend: number;
    timeToHireTrend: number;
}

export interface Activity {
    id: string;
    type: "user" | "ai" | "calendar" | "status";
    description: string;
    timestamp: Date;
    aiPowered: boolean;
}

export interface DashboardData {
    metrics: DashboardMetrics;
    activities: Activity[];
    totalActivities: number;
}

export interface DashboardResponse {
    status: boolean;
    message: string;
    data: DashboardData;
    error?: Record<string, string[]>;
}
