"use client";

import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";
import { MainContent } from "@/components/main-content";
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
      
      <MainContent>
        <DashboardHeader user={user} />
        
        <Drawer jobId={jobId} />
      </MainContent>
    </div>
  );
}
