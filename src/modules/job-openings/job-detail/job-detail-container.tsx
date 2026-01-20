"use client";

import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";
import { Drawer } from "./components/drawer";

interface JobDetailContainerProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      name?: string;
      full_name?: string;
    };
  };
  jobId: string;
}

export default function JobDetailContainer({ user, jobId }: JobDetailContainerProps) {
  return (
    <div className="flex min-h-screen bg-[#F7F8FC] dark:bg-neutral-900">
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col ml-64">
        <DashboardHeader user={user} />
        
        <Drawer jobId={jobId} />
      </div>
    </div>
  );
}
