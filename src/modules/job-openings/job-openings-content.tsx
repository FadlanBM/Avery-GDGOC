"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, MoreVertical, Plus, ChevronLeft, ChevronRight } from "lucide-react";

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

export default function JobOpeningsContent({ user }: JobOpeningsContentProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  // Calculate pagination
  const totalPages = Math.ceil(jobOpenings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobs = jobOpenings.slice(startIndex, endIndex);
  
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };
  
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };
  
  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex min-h-screen bg-[#F7F8FC] dark:bg-neutral-900">
      {/* Sidebar */}
      <DashboardSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Header */}
        <DashboardHeader user={user} />
        
        {/* Page Content */}
        <main className="flex-1 p-8 mt-16">
          {/* Page Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                Job Openings
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                Manage your active job postings and view applicants
              </p>
            </div>
            <Button className="bg-[#2563EB] hover:bg-[#1E40AF] text-white">
              <Plus className="mr-1 h-6 w-6" /> Create Job
            </Button>
          </div>

          {/* Job Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentJobs.map((job) => (
              <Card key={job.id} className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                {/* Card Header with Menu */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-1">
                      {job.title}
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {job.department}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-neutral-600">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>

                {/* Job Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                    <MapPin className="h-4 w-4 mr-2" />
                    {job.location}
                  </div>
                  <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                    <Clock className="h-4 w-4 mr-2" />
                    {job.type}
                  </div>
                </div>

                {/* Footer with Applicants and Status */}
                <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                    <Users className="h-4 w-4 mr-1.5" />
                    <span className="font-medium">{job.applicants} applicants</span>
                  </div>
                  <Badge 
                    className={`${
                      job.status === "Active" 
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
                        : "bg-neutral-100 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
                    } border-0`}
                  >
                    {job.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="h-9 w-9 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    onClick={() => handlePageClick(page)}
                    className={`h-9 w-9 ${
                      currentPage === page
                        ? "bg-[#2563EB] hover:bg-[#1E40AF] text-white"
                        : ""
                    }`}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="h-9 w-9 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
