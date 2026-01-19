"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";
import { Drawer } from "./components/drawer";

interface JobOpeningsContainerProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      name?: string;
      full_name?: string;
    };
  };
}

// Sample job data based on the design
const jobOpenings = [
  {
    id: 1,
    title: "Senior React Developer",
    department: "Engineering",
    location: "San Francisco, CA",
    type: "Full-time",
    applicants: 47,
    status: "Active",
  },
  {
    id: 2,
    title: "Product Manager",
    department: "Product",
    location: "Remote",
    type: "Full-time",
    applicants: 62,
    status: "Active",
  },
  {
    id: 3,
    title: "UX Designer",
    department: "Design",
    location: "New York, NY",
    type: "Full-time",
    applicants: 38,
    status: "Active",
  },
  {
    id: 4,
    title: "Backend Engineer",
    department: "Engineering",
    location: "Austin, TX",
    type: "Full-time",
    applicants: 29,
    status: "Active",
  },
  {
    id: 5,
    title: "Data Scientist",
    department: "Data",
    location: "Remote",
    type: "Full-time",
    applicants: 54,
    status: "Paused",
  },
  {
    id: 6,
    title: "DevOps Engineer",
    department: "Engineering",
    location: "Seattle, WA",
    type: "Contract",
    applicants: 18,
    status: "Active",
  },
  {
    id: 7,
    title: "DevOps Engineer",
    department: "Engineering",
    location: "Seattle, WA",
    type: "Contract",
    applicants: 18,
    status: "Active",
  },
  {
    id: 8,
    title: "DevOps Engineer",
    department: "Engineering",
    location: "Seattle, WA",
    type: "Contract",
    applicants: 18,
    status: "Active",
  },
  {
    id: 9,
    title: "DevOps Engineer",
    department: "Engineering",
    location: "Seattle, WA",
    type: "Contract",
    applicants: 18,
    status: "Active",
  }
];

export default function JobOpeningsContainer({ user }: JobOpeningsContainerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  // Calculate pagination
  const totalPages = Math.ceil(jobOpenings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobs = jobOpenings.slice(startIndex, endIndex);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex min-h-screen bg-[#F7F8FC] dark:bg-neutral-900">
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col ml-64">
        <DashboardHeader user={user} />
        
        <Drawer
          currentJobs={currentJobs}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
