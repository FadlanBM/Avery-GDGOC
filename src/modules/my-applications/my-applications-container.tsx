"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import axiosSupabase from "@/lib/axios-supabase";
import { toast } from "sonner";
import { AlertCircle, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/pagination";
import { ApplicationCard } from "./components/application-card";
import { JobApplication, ApplicationsResponse } from "@/modules/candidate-jobs/types";

export function MyApplicationsContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1");
    setCurrentPage(page);
    fetchApplications(page);
  }, [searchParams]);

  const fetchApplications = async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", itemsPerPage.toString());
      
      const search = searchParams.get("search");
      if (search) params.set("search", search);
      
      const response = await axiosSupabase.get<ApplicationsResponse>(
        `/api/candidate/job-application?${params.toString()}`
      );

      if (response.data.status) {
        setApplications(response.data.data);
        setTotalPages(response.data.pagination.total_pages);
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to load applications");
      } else {
        setError("An error occurred while loading applications");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (applicationId: string) => {
    setWithdrawingId(applicationId);

    try {
      const response = await axiosSupabase.delete(
        `/api/candidate/job-application/${applicationId}`
      );

      if (response.data.status) {
        toast.success("Application withdrawn successfully");
        
        // Refresh the list
        fetchApplications(currentPage);
      }
    } catch (err) {
      console.error("Error withdrawing application:", err);
      if (axios.isAxiosError(err)) {
        toast.error("Failed to withdraw application", {
          description: err.response?.data?.message || "Please try again later.",
        });
      } else {
        toast.error("An error occurred", {
          description: "Please try again later.",
        });
      }
    } finally {
      setWithdrawingId(null);
    }
  };

  const handlePageChange = (page: number) => {
    router.push(`/my-applications?page=${page}`);
  };

  const handleBrowseJobs = () => {
    router.push("/jobs");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
              My Applications
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
              Track your job applications
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-9 w-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
          My Applications
        </h1>
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
            Error Loading Applications
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center max-w-md mb-6">
            {error}
          </p>
          <Button
            onClick={() => fetchApplications(currentPage)}
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
            My Applications
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Track your job applications and their status
          </p>
        </div>
        <Button
          onClick={handleBrowseJobs}
          className="bg-[#265BFF] hover:bg-[#1E40AF] text-white"
        >
          Browse Jobs
        </Button>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-neutral-100 dark:bg-neutral-800 p-6 mb-6">
              <Briefcase className="h-12 w-12 text-neutral-400 dark:text-neutral-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
              No Applications Yet
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mb-6">
              You haven&apos;t applied to any jobs yet. Start exploring opportunities and
              submit your applications.
            </p>
            <Button
              onClick={handleBrowseJobs}
              className="bg-[#265BFF] hover:bg-[#1E40AF] text-white"
            >
              Browse Jobs
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {applications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onWithdraw={handleWithdraw}
                isWithdrawing={withdrawingId === application.id}
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
    </div>
  );
}
