import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, MoreVertical } from "lucide-react";

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  applicants: number;
  status: string;
}

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  return (
    <Card className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
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
  );
}
