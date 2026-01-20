"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";
import { Drawer } from "./components/drawer";

interface JobOpeningsContainerProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      name?: string;
      full_name?: string;
    };
  };
}

interface Job {
  id: string;
  title: string;
  status: string;
  work_schedule: { id: number; name: string };
  remote_status: { id: number; name: string };
  employment_status: { id: number; name: string };
  education_level: { id: number; name: string };
  min_experience_year: number;
  max_experience_year: number;
  no_experience_allowed: boolean;
  created_at: string;
}

export default function JobOpeningsContainer({ user }: JobOpeningsContainerProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/job?page=${currentPage}&limit=${itemsPerPage}`);
      console.log("API Response:", response.data);
      setJobs(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err: any) {
      console.error("Error fetching jobs:", err);
      console.error("Error response:", err.response?.data);
      setError(err.response?.data?.message || "Failed to load job openings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [currentPage]);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRetry = () => {
    fetchJobs();
  };

  return (
    <div className="flex min-h-screen bg-[#F7F8FC] dark:bg-neutral-900">
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col ml-64">
        <DashboardHeader user={user} />
        
        <Drawer
          jobs={jobs}
          loading={loading}
          error={error}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onRetry={handleRetry}
        />
      </div>
    </div>
  );
}
