"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { DateRangeSelector } from "./date-range-selector";
import { MetricsOverview } from "./metrics-overview";
import { HiringFunnelChart } from "./hiring-funnel-chart";
import { TopJobsTable } from "./top-jobs-table";
import { ApplicationTrendChart } from "./application-trend-chart";
import { OnboardingEmptyState } from "./onboarding-empty-state";
import { ExportPDFButton } from "./export-pdf-button";
import { AnalyticsData, DateRangePreset } from "../types";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Drawer() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] =
    useState<DateRangePreset>("30days");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAnalytics = async (startDate?: string, endDate?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await axios.get(`/api/analytics?${params.toString()}`);
      console.log(response);

      if (response.data.status) {
        setData(response.data.data);
        setLastUpdated(new Date());
      } else {
        setError(response.data.message || "Failed to fetch analytics");
      }
    } catch (err: any) {
      console.error("Error fetching analytics:", err);
      setError(err.response?.data?.message || "Failed to load analytics data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Calculate initial date range based on preset
    const { startDate, endDate } = calculateDateRange(selectedPreset);
    fetchAnalytics(startDate, endDate);
  }, []);

  const calculateDateRange = (preset: DateRangePreset) => {
    const today = new Date();
    let startDate = new Date();
    let endDate = today;

    switch (preset) {
      case "7days":
        startDate.setDate(today.getDate() - 7);
        break;
      case "30days":
        startDate.setDate(today.getDate() - 30);
        break;
      case "90days":
        startDate.setDate(today.getDate() - 90);
        break;
      case "thisMonth":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case "lastMonth":
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case "custom":
        // Use custom dates
        return {
          startDate: customStartDate,
          endDate: customEndDate,
        };
    }

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  };

  const handlePresetChange = (preset: DateRangePreset) => {
    setSelectedPreset(preset);

    if (preset !== "custom") {
      const { startDate, endDate } = calculateDateRange(preset);
      fetchAnalytics(startDate, endDate);
    }
  };

  const handleCustomDateChange = (startDate: string, endDate: string) => {
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
  };

  const handleApplyCustomRange = () => {
    if (customStartDate && customEndDate) {
      fetchAnalytics(customStartDate, customEndDate);
    }
  };

  const handleRefresh = () => {
    const { startDate, endDate } = calculateDateRange(selectedPreset);
    fetchAnalytics(startDate, endDate);
  };

  if (error) {
    return (
      <>
        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-4">
          Analytics
        </h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p className="font-semibold">Error loading analytics</p>
          <p className="text-sm">{error}</p>
          <Button
            onClick={handleRefresh}
            className="mt-4"
            variant="outline"
            size="sm"
          >
            Try Again
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-4 lg:mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-50">
            Analytics
          </h1>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground mt-1">
              Last updated: {lastUpdated.toLocaleTimeString("id-ID")}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="default">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          {/* {data && !data.isEmpty && (
            <ExportPDFButton
              dateRange={{
                startDate: data.dateRange.startDate,
                endDate: data.dateRange.endDate,
              }}
            />
          )} */}
        </div>
      </div>

      <div className="mb-4 lg:mb-6 flex justify-start items-center">
        <DateRangeSelector
          selectedPreset={selectedPreset}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
          onPresetChange={handlePresetChange}
          onCustomDateChange={handleCustomDateChange}
          onApply={handleApplyCustomRange}
        />
      </div>

      {data?.isEmpty ? (
        <OnboardingEmptyState />
      ) : (
        <div className="space-y-4 lg:space-y-6">
          <div data-export="metrics">
            <MetricsOverview data={data?.metrics!} isLoading={isLoading} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div data-export="funnel">
              <HiringFunnelChart
                data={data?.hiringFunnel!}
                isLoading={isLoading}
              />
            </div>

            <div data-export="trends">
              <ApplicationTrendChart
                data={data?.applicationTrends!}
                isLoading={isLoading}
              />
            </div>
          </div>

          <div data-export="table">
            <TopJobsTable data={data?.topJobs || []} isLoading={isLoading} />
          </div>
        </div>
      )}
    </>
  );
}
