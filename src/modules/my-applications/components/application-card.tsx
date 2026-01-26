"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Calendar, Trash2 } from "lucide-react";
import { JobApplication } from "@/modules/candidate-jobs/types";

interface ApplicationCardProps {
  application: JobApplication;
  onWithdraw: (id: string) => void;
  isWithdrawing?: boolean;
}

export function ApplicationCard({
  application,
  onWithdraw,
  isWithdrawing = false,
}: ApplicationCardProps) {
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("applied") || statusLower.includes("pending")) {
      return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
    }
    if (statusLower.includes("interview")) {
      return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
    }
    if (statusLower.includes("offer") || statusLower.includes("hired")) {
      return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
    }
    if (statusLower.includes("reject")) {
      return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
    }
    return "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 truncate">
              {application.job.title}
            </h3>
            {application.job.companie && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                {application.job.companie.name}
              </p>
            )}
          </div>
          <Badge className={getStatusColor(application.status)}>
            {application.status}
          </Badge>
        </div>

        {/* Job Details */}
        <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
          {application.job.employment_status && (
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {application.job.employment_status.name}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>Applied on {formatDate(application.applied_at)}</span>
          </div>
        </div>

        {/* Additional Info */}
        <div className="flex flex-wrap gap-2">
          {application.job.remote_status && (
            <Badge variant="secondary" className="text-xs">
              {application.job.remote_status.name}
            </Badge>
          )}
          {application.job.work_schedule && (
            <Badge variant="secondary" className="text-xs">
              {application.job.work_schedule.name}
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
            disabled={isWithdrawing}
            onClick={() => {
              if (window.confirm(`Are you sure you want to withdraw your application for ${application.job.title}? This action cannot be undone.`)) {
                onWithdraw(application.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Withdraw Application
          </Button>
        </div>
      </div>
    </Card>
  );
}
