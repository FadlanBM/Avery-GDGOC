"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Clock, CheckCircle2 } from "lucide-react";
import { Job } from "../types";
import { useRouter, useSearchParams } from "next/navigation";

interface JobCardProps {
  job: Job;
  isApplied?: boolean;
}

export function JobCard({ job, isApplied = false }: JobCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleViewDetails = () => {
    // Preserve current filters when navigating
    const params = new URLSearchParams(searchParams.toString());
    router.push(`/jobs/${job.id}?${params.toString()}`);
  };

  const formatExperience = () => {
    if (job.no_experience_allowed) {
      return "No experience required";
    }
    if (job.min_experience_year === 0 && job.max_experience_year === 0) {
      return "Experience not specified";
    }
    if (job.min_experience_year === job.max_experience_year) {
      return `${job.min_experience_year} years`;
    }
    return `${job.min_experience_year}-${job.max_experience_year} years`;
  };

  return (
    <Card className="p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 truncate group-hover:text-[#265BFF] transition-colors">
              {job.title}
            </h3>
            {job.companie && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                {job.companie.name}
              </p>
            )}
          </div>
          {isApplied && (
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 flex items-center gap-1 shrink-0">
              <CheckCircle2 className="h-3 w-3" />
              Applied
            </Badge>
          )}
        </div>

        {/* Details */}
        <div className="space-y-2">
          {job.companie && (
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{job.companie.name}</span>
            </div>
          )}
          {job.work_schedule && (
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <Clock className="h-4 w-4 shrink-0" />
              <span className="truncate">{job.work_schedule.name}</span>
            </div>
          )}
          {job.employment_status && (
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <Briefcase className="h-4 w-4 shrink-0" />
              <span className="truncate">{job.employment_status.name}</span>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {job.remote_status && (
            <Badge variant="secondary" className="text-xs">
              {job.remote_status.name}
            </Badge>
          )}
          {job.education_level && (
            <Badge variant="secondary" className="text-xs">
              {job.education_level.name}
            </Badge>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            {formatExperience()}
          </div>
          <Button
            onClick={handleViewDetails}
            size="sm"
            className="bg-[#265BFF] hover:bg-[#1E40AF] text-white"
          >
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
}
