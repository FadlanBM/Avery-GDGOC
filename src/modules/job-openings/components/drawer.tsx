import { PageHeader } from "./page-header";
import { JobsGrid } from "./jobs-grid";
import { JobPagination } from "./job-pagination";

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
  onPreviousPage: () => void;
  onNextPage: () => void;
  onPageClick: (page: number) => void;
}

export function Drawer({
  currentJobs,
  currentPage,
  totalPages,
  onPreviousPage,
  onNextPage,
  onPageClick,
}: JobOpeningsDrawerProps) {
  return (
    <main className="flex-1 p-8 mt-16">
      <PageHeader />
      
      <JobsGrid jobs={currentJobs} />
      
      <JobPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
        onPageClick={onPageClick}
      />
    </main>
  );
}
