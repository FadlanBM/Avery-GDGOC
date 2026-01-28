import { Pagination } from "@/components/pagination";
import { PageHeader } from "./page-header";
import { JobsGrid } from "./jobs-grid";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

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

interface JobOpeningsDrawerProps {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRetry: () => void;
}

export function Drawer({
  jobs,
  loading,
  error,
  currentPage,
  totalPages,
  onPageChange,
  onRetry,
}: JobOpeningsDrawerProps) {
  return (
    <>
      <PageHeader />
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-48 lg:h-64 animate-pulse bg-neutral-200 dark:bg-neutral-800" />
          ))}
        </div>
      ) : error ? (
        <Card className="p-6 lg:p-8 text-center">
          <AlertCircle className="h-10 lg:h-12 w-10 lg:w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Jobs</h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">{error}</p>
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </Card>
      ) : jobs.length === 0 ? (
        <Card className="p-6 lg:p-8 text-center">
          <p className="text-neutral-600 dark:text-neutral-400">No job openings found.</p>
        </Card>
      ) : (
        <>
          <JobsGrid jobs={jobs} />
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            variant="simple"
            showFirstLast={false}
          />
        </>
      )}
    </>
  );
}
