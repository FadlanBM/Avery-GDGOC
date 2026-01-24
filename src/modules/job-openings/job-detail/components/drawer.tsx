import { JobDetailContent } from "./job-detail-content";

interface DrawerProps {
  jobId: string;
}

export function Drawer({ jobId }: DrawerProps) {
  return (
    <main className="flex-1 p-8 mt-16">
      <JobDetailContent jobId={jobId} />
    </main>
  );
}
