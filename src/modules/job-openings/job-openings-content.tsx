"use client";

import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";

interface JobOpeningsContentProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      name?: string;
      full_name?: string;
    };
  };
}

export default function JobOpeningsContent({ user }: JobOpeningsContentProps) {
  return (
    <div className="flex min-h-screen bg-[#F7F8FC] dark:bg-neutral-900">
      {/* Sidebar */}
      <DashboardSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <DashboardHeader user={user} />
        
        {/* Page Content */}
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-4">
            Job Openings
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Job openings content coming soon...
          </p>
        </main>
      </div>
    </div>
  );
}
