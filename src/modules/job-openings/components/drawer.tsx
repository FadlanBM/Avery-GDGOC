import { Pagination } from "@/components/pagination";
import { PageHeader } from "./page-header";
import { JobsGrid } from "./jobs-grid";

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  applicants: number;
  status: string;
}

interface JobOpeningsDrawerProps {
  currentJobs: Job[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Drawer({
  currentJobs,
  currentPage,
  totalPages,
  onPageChange,
}: JobOpeningsDrawerProps) {
  return (
    <main className="flex-1 p-8 mt-16">
      <PageHeader />
      
      <JobsGrid jobs={currentJobs} />
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        variant="simple"
        showFirstLast={false}
      />
    </main>
  );
}
