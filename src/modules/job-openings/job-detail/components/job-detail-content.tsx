"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Clock, Briefcase, GraduationCap, Calendar, Building, User, Loader2, XCircle, CheckCircle2, DollarSign, ExternalLink } from "lucide-react";

interface Job {
  id: string;
  title: string;
  description: string;
  status: string;
  min_experience_year: number;
  max_experience_year: number;
  no_experience_allowed: boolean;
  created_at: string;
  updated_at: string | null;
  published_at: string | null;
  employment_status: { id: number; name: string } | null;
  work_schedule: { id: number; name: string } | null;
  remote_status: { id: number; name: string } | null;
  education_level: { id: number; name: string } | null;
  companie: { id: string; name: string } | null;
  created_by: { id: string; email: string } | null;
}

interface JobDetailContentProps {
  jobId: string;
}

export function JobDetailContent({ jobId }: JobDetailContentProps) {
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    fetchJobDetail();
  }, [jobId]);

  const fetchJobDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/job/${jobId}`);
      if (response.data.status) {
        setJob(response.data.data);
      } else {
        setError(response.data.message || "Failed to load job details");
      }
    } catch (err: any) {
      console.error("Error fetching job:", err);
      setError(err.response?.data?.message || "Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseJob = async () => {
    if (!job) return;
    
    if (!confirm("Are you sure you want to close this job opening?")) {
      return;
    }

    try {
      setClosing(true);
      const response = await axios.put(`/api/job?id=${job.id}`, {
        status: "closed",
      });

      if (response.data.status) {
        // Refresh job data
        fetchJobDetail();
      } else {
        alert(response.data.message || "Failed to close job");
      }
    } catch (err: any) {
      console.error("Error closing job:", err);
      alert(err.response?.data?.message || "Failed to close job");
    } finally {
      setClosing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <Card className="p-8 text-center">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Job</h3>
        <p className="text-neutral-600 dark:text-neutral-400 mb-4">
          {error || "Job not found"}
        </p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </Card>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header - Back Button & Status */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2 -ml-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {job.status !== "closed" && (
          <Button
            size="sm"
            onClick={handleCloseJob}
            disabled={closing}
            className="gap-2 bg-transparent text-red-500 hover:bg-red-50 hover:text-red-600 border border-red-500 hover:border-red-600"
          >
            {closing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Closing...
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4" />
                Close Job
              </>
            )}
          </Button>
        )}
      </div>

      {/* Main Content Card */}
      <Card className="border-0 shadow-sm bg-white dark:bg-neutral-800">
        <div className="p-8 space-y-6">
          {/* Job Title */}
          <div className="border-b pb-6 ">
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
              {job.title}
            </h1>

            {/* Company Name with View all jobs link */}
            {job.companie && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                  {job.companie.name}
                </span>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <Button
                  variant="link"
                  className="text-blue-600 hover:text-blue-700 p-0 h-auto font-normal text-sm"
                  onClick={() => router.push("/job-openings")}
                >
                  View all jobs
                </Button>
              </div>
            )}

            {/* Location & Job Details */}
            <div className="space-y-2 mb-4">
              {job.remote_status && (
                <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{job.remote_status.name}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                {job.employment_status && (
                  <Badge variant="secondary" className="rounded-full bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 border-0 font-normal">
                    {job.employment_status.name}
                  </Badge>
                )}
                {job.work_schedule && (
                  <Badge variant="secondary" className="rounded-full bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 border-0 font-normal">
                    {job.work_schedule.name}
                  </Badge>
                )}
              </div>
            </div>

            {/* Posted Time & Status Badge */}
            <div className="flex items-center gap-3 mt-4">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                Posted {new Date(job.created_at).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                })} ago
              </span>
              <Badge
                className={`${
                  job.status === "published"
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : job.status === "closed"
                    ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                    : "bg-neutral-100 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
                } border-0 font-normal`}
              >
                {job.status}
              </Badge>
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-4">
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
              {job.description}
            </p>
          </div>

          {/* Requirements Section */}
          {(job.min_experience_year > 0 || job.education_level) && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                Requirements:
              </h2>
              <ul className="space-y-2 list-none">
                {!job.no_experience_allowed && (
                  <li className="flex items-start gap-2 text-neutral-700 dark:text-neutral-300">
                    <span className="text-neutral-400 dark:text-neutral-500 mt-1">•</span>
                    <span>
                      {job.min_experience_year === job.max_experience_year
                        ? `This is an on-site, ${job.min_experience_year} year${job.min_experience_year > 1 ? 's' : ''} experience position`
                        : `This is an on-site, ${job.min_experience_year}-${job.max_experience_year} years experience position`}
                    </span>
                  </li>
                )}
                {job.education_level && (
                  <li className="flex items-start gap-2 text-neutral-700 dark:text-neutral-300">
                    <span className="text-neutral-400 dark:text-neutral-500 mt-1">•</span>
                    <span>
                      Preferably {job.education_level.name} Degree/Bachelor Degree from Linguistics/Translation/Language major
                    </span>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Additional Job Information */}
          <div className="pt-6 border-t space-y-3 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {job.published_at && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-neutral-400" />
                  <span className="text-neutral-600 dark:text-neutral-400">
                    Published: {new Date(job.published_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
              {job.education_level && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-neutral-400" />
                  <span className="text-neutral-600 dark:text-neutral-400">
                    {job.education_level.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
