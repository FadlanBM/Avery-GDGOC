"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, MoreVertical } from "lucide-react";

interface Job {
  id: string;
  title: string;
  status: string;
  work_schedule: { id: number; name: string };
  remote_status: { id: number; name: string };
  employment_status: { id: number; name: string };
  education_level: { id: number; name: string };
  min_experience_year: number;
  max_experience_year: number;
  no_experience_allowed: boolean;
  created_at: string;
}

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const router = useRouter();

  return (
    <Card 
      className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-4 lg:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => router.push(`/job-openings/${job.id}`)}
    >
      {/* Card Header with Menu */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-base lg:text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-1 pr-2">
            {job.title}
          </h3>
          <p className="text-xs lg:text-sm text-neutral-500 dark:text-neutral-400">
            {job.education_level?.name || "No education requirement"}
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-neutral-400 hover:text-neutral-600 flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            // Add menu action here
          }}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      {/* Job Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-xs lg:text-sm text-neutral-600 dark:text-neutral-400">
          <MapPin className="h-3 w-3 lg:h-4 lg:w-4 mr-2 flex-shrink-0" />
          <span className="truncate">{job.remote_status?.name || "Not specified"}</span>
        </div>
        <div className="flex items-center text-xs lg:text-sm text-neutral-600 dark:text-neutral-400">
          <Clock className="h-3 w-3 lg:h-4 lg:w-4 mr-2 flex-shrink-0" />
          <span className="truncate">{job.work_schedule?.name || "Not specified"}</span>
        </div>
      </div>

      {/* Footer with Experience and Status */}
      <div className="flex items-center justify-between pt-3 lg:pt-4 border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center text-xs lg:text-sm text-neutral-600 dark:text-neutral-400 min-w-0 flex-1">
          <Users className="h-3 w-3 lg:h-4 lg:w-4 mr-1.5 flex-shrink-0" />
          <span className="font-medium truncate">
            {job.no_experience_allowed 
              ? "No experience required" 
              : job.min_experience_year > 0 
              ? `${job.min_experience_year}+ years` 
              : job.employment_status?.name || "Not specified"}
          </span>
        </div>
        <Badge 
          className={`${
            job.status === "published" 
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
              : job.status === "closed" 
              ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
              : "bg-neutral-100 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
          } border-0 text-xs lg:text-sm flex-shrink-0 ml-2`}
        >
          {job.status}
        </Badge>
      </div>
    </Card>
  );
}
