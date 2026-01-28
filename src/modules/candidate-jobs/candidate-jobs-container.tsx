"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import axiosSupabase from "@/lib/axios-supabase";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/pagination";
import LoginPromptModal from "@/components/login-prompt-modal";
import { JobCard } from "./components/job-card";
import { JobFilters } from "./components/job-filters";
import { JobListSkeleton } from "./components/job-list-skeleton";
import { EmptyState } from "./components/empty-state";
import { Job, JobApplication, JobsResponse, ApplicationsResponse } from "./types";

interface CandidateJobsContainerProps {
  isGuest?: boolean;
}

export function CandidateJobsContainer({ isGuest = false }: CandidateJobsContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const itemsPerPage = 9;

  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1");
    setCurrentPage(page);
    fetchData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchData = async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", itemsPerPage.toString());
      params.set("status", "published");

      const search = searchParams.get("search");
      if (search) params.set("search", search);

      // For guest mode, only fetch jobs. For authenticated users, fetch both jobs and applications
      const promises = [axios.get<JobsResponse>(`/api/candidate/job?${params.toString()}`)];
      
      if (!isGuest) {
        promises.push(
          axiosSupabase.get<ApplicationsResponse>("/api/candidate/job-application?limit=1000")
        );
      }

      const [jobsResponse, applicationsResponse] = await Promise.all(promises);

      if (jobsResponse.data.status) {
        setJobs(jobsResponse.data.data);
        setTotalPages(jobsResponse.data.pagination.total_pages);
      }

      if (!isGuest && applicationsResponse?.data.status) {
        const appliedIds = new Set(
          applicationsResponse.data.data.map((app: JobApplication) => app.job_id)
        );
        setAppliedJobIds(appliedIds);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to load jobs");
      } else {
        setError("An error occurred while loading jobs");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/jobs?${params.toString()}`);
  };

  const handleClearFilters = () => {
    router.push("/jobs");
  };

  const handleApplyJob = () => {
    if (isGuest) {
      setShowLoginPrompt(true);
    }
    // For authenticated users, the apply logic is handled in JobCard component
  };

  const hasFilters = Array.from(searchParams.keys()).some(
    (key) => key !== "page" && key !== "limit"
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
              Find Jobs
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
              Discover your next career opportunity
            </p>
          </div>
        </div>
        <JobFilters />
        <JobListSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
          Find Jobs
        </h1>
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
            Error Loading Jobs
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center max-w-md mb-6">
            {error}
          </p>
          <Button
            onClick={() => fetchData(currentPage)}
            className="bg-[#265BFF] hover:bg-[#1E40AF] text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
            Find Jobs
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Discover your next career opportunity
            {isGuest && " (Mode Tamu)"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <JobFilters isGuest={isGuest} />

      {/* Job List */}
      {jobs.length === 0 ? (
        <EmptyState hasFilters={hasFilters} onClearFilters={handleClearFilters} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isApplied={!isGuest && appliedJobIds.has(job.id)}
                isGuest={isGuest}
                onGuestApply={handleApplyJob}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-end">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                variant="simple"
              />
            </div>
          )}
        </>
      )}
      
      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        title="Login untuk Melamar Pekerjaan"
        description="Silakan login terlebih dahulu untuk melamar pekerjaan ini dan menggunakan fitur lainnya."
      />
    </div>
  );
}
