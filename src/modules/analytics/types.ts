export interface AnalyticsMetrics {
  totalApplications: number;
  activeJobs: number;
  avgTimeToHire: number;
  hiredCount: number;
  avgMatchScore: number;
  successRate: number;
  totalApplicationsPrevious: number;
  activeJobsPrevious: number;
  hiredCountPrevious: number;
}

export interface HiringFunnel {
  applied: number;
  screening: number;
  interview: number;
  offer: number;
  hired: number;
}

export interface TopJob {
  id: string;
  title: string;
  applicantCount: number;
  hiredCount: number;
  avgMatchScore: number;
  conversionRate: number;
}

export interface TrendDataPoint {
  date: string;
  count: number;
}

export interface ApplicationTrends {
  current: TrendDataPoint[];
  previous: TrendDataPoint[];
}

export interface DateRange {
  startDate: string;
  endDate: string;
  previousStartDate: string;
  previousEndDate: string;
}

export interface AnalyticsData {
  isEmpty: boolean;
  metrics: AnalyticsMetrics;
  hiringFunnel: HiringFunnel;
  topJobs: TopJob[];
  applicationTrends: ApplicationTrends;
  dateRange: DateRange;
}

export interface AnalyticsResponse {
  status: boolean;
  message: string;
  data: AnalyticsData;
  error?: Record<string, string[]>;
}

export type DateRangePreset = "7days" | "30days" | "90days" | "thisMonth" | "lastMonth" | "custom";
