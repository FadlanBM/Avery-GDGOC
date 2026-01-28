"use client";

import { Drawer } from "./components/drawer";

interface JobDetailContainerProps {
  jobId: string;
}

export default function JobDetailContainer({ jobId }: JobDetailContainerProps) {
  return <Drawer jobId={jobId} />;
}
