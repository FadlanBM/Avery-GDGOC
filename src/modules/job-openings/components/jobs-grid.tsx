import { JobCard } from "./job-card";

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  applicants: number;
  status: string;
}

interface JobsGridProps {
  jobs: Job[];
}

export function JobsGrid({ jobs }: JobsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
