"use client";

import { Suspense } from "react";
import { JobDetailContent } from "./components/job-detail-content";

interface JobDetailContainerProps {
  jobId: string;
}

export function JobDetailContainer({ jobId }: JobDetailContainerProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JobDetailContent jobId={jobId} />
    </Suspense>
  );
}
