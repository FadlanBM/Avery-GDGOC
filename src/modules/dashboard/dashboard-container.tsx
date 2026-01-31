"use client";

import { useState, useEffect, useCallback } from "react";
import { Drawer } from "./components/drawer";
import { DashboardMetrics, Activity } from "./types";

interface DashboardContainerProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      name?: string;
      full_name?: string;
    };
  };
}

export default function DashboardContainer({ user }: DashboardContainerProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | undefined>();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [totalActivities, setTotalActivities] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const itemsPerPage = 7;
  const totalPages = Math.ceil(totalActivities / itemsPerPage);

  const fetchDashboardData = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/dashboard?page=${page}&limit=${itemsPerPage}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      
      const result = await response.json();
      
      if (result.status) {
        setMetrics(result.data.metrics);
        // Convert timestamp strings back to Date objects
        const activitiesWithDates = result.data.activities.map((activity: Activity & { timestamp: string }) => ({
          ...activity,
          timestamp: new Date(activity.timestamp),
        }));
        setActivities(activitiesWithDates);
        setTotalActivities(result.data.totalActivities);
      } else {
        setError(result.message || "Failed to load dashboard data");
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(currentPage);
  }, [currentPage, fetchDashboardData]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (error && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => fetchDashboardData(currentPage)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <Drawer
      user={user}
      metrics={metrics}
      activities={activities}
      currentPage={currentPage}
      totalPages={totalPages}
      isLoading={isLoading}
      onPageChange={goToPage}
    />
  );
}
