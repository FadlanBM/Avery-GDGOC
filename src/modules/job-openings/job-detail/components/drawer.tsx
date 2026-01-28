import { JobDetailContent } from "./job-detail-content";

interface DrawerProps {
  jobId: string;
}

export function Drawer({ jobId }: DrawerProps) {
  return <JobDetailContent jobId={jobId} />;
}
