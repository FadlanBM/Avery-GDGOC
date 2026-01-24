import { JobCard } from "./job-card";

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
