"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";
import { Drawer } from "./components/drawer";

interface DashboardContainerProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      name?: string;
      full_name?: string;
    };
  };
}

// Mock activities data
const allActivities = [
  {
    id: 1,
    type: "user" as const,
    description: "Alex Thompson applied for Senior React Developer",
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    aiPowered: false,
  },
  {
    id: 2,
    type: "ai" as const,
    description: "AI Analysis complete for Candidate #402 - Sarah Jenkin",
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    aiPowered: true,
  },
  {
    id: 3,
    type: "calendar" as const,
    description: "Interview scheduled with Marcus Chen for tomorrow at 2 PM",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    aiPowered: false,
  },
  {
    id: 4,
    type: "status" as const,
    description: "Emily Rodriguez moved to Interview stage",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    aiPowered: false,
  },
  {
    id: 5,
    type: "user" as const,
    description: "3 new applications received for Product Manager role",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    aiPowered: false,
  },
  {
    id: 6,
    type: "ai" as const,
    description: "AI screening completed for 12 Backend Engineer candidates",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    aiPowered: true,
  },
  {
    id: 7,
    type: "calendar" as const,
    description: "Interview with Jessica Wu completed - Feedback submitted",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    aiPowered: false,
  },
  {
    id: 8,
    type: "user" as const,
    description: "Michael Brown applied for UX Designer position",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    aiPowered: false,
  },
  {
    id: 9,
    type: "status" as const,
    description: "David Kim moved to Final Interview stage",
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
    aiPowered: false,
  },
  {
    id: 10,
    type: "ai" as const,
    description: "AI recommended 5 top candidates for Data Scientist role",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    aiPowered: true,
  },
  {
    id: 11,
    type: "calendar" as const,
    description: "Interview scheduled with Amanda Lee for next Monday at 10 AM",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    aiPowered: false,
  },
  {
    id: 12,
    type: "user" as const,
    description: "Robert Wilson applied for DevOps Engineer",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000),
    aiPowered: false,
  },
  {
    id: 13,
    type: "status" as const,
    description: "Lisa Anderson received job offer - Accepted",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    aiPowered: false,
  },
  {
    id: 14,
    type: "ai" as const,
    description: "AI Analysis identified skill gaps in candidate pool",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 5 * 60 * 60 * 1000),
    aiPowered: true,
  },
  {
    id: 15,
    type: "user" as const,
    description: "7 new applications received for Frontend Developer role",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    aiPowered: false,
  },
];

export default function DashboardContainer({ user }: DashboardContainerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  
  // Calculate pagination
  const totalPages = Math.ceil(allActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActivities = allActivities.slice(startIndex, endIndex);
  
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="flex min-h-screen bg-[#F7F8FC] dark:bg-neutral-900">
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col ml-64">
        <DashboardHeader user={user} />
        
        <Drawer
          user={user}
          currentActivities={currentActivities}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
        />
      </div>
    </div>
  );
}
