"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Clock, Briefcase, GraduationCap, Calendar, Building, User, Loader2, XCircle } from "lucide-react";

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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex items-center gap-3">
          <Badge
            className={`${
              job.status === "published"
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : job.status === "closed"
                ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                : "bg-neutral-100 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
            } border-0`}
          >
            {job.status}
          </Badge>

          {job.status !== "closed" && (
            <Button
              variant="destructive"
              onClick={handleCloseJob}
              disabled={closing}
              className="gap-2"
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
      </div>

      {/* Job Title & Company */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
              {job.title}
            </h1>
            {job.companie && (
              <div className="flex items-center text-neutral-600 dark:text-neutral-400">
                <Building className="h-5 w-5 mr-2" />
                <span className="text-lg">{job.companie.name}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {job.remote_status && (
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-neutral-500" />
                <span>{job.remote_status.name}</span>
              </div>
            )}

            {job.work_schedule && (
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-neutral-500" />
                <span>{job.work_schedule.name}</span>
              </div>
            )}

            {job.employment_status && (
              <div className="flex items-center text-sm">
                <Briefcase className="h-4 w-4 mr-2 text-neutral-500" />
                <span>{job.employment_status.name}</span>
              </div>
            )}

            {job.education_level && (
              <div className="flex items-center text-sm">
                <GraduationCap className="h-4 w-4 mr-2 text-neutral-500" />
                <span>{job.education_level.name}</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Job Description */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Job Description</h2>
        <div className="prose dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
            {job.description}
          </p>
        </div>
      </Card>

      {/* Requirements */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Requirements</h2>
        <div className="space-y-3">
          <div>
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              Experience Level:{" "}
            </span>
            <span className="text-neutral-600 dark:text-neutral-400">
              {job.no_experience_allowed
                ? "No experience required"
                : job.min_experience_year === job.max_experience_year
                ? `${job.min_experience_year} years`
                : `${job.min_experience_year}-${job.max_experience_year} years`}
            </span>
          </div>

          {job.education_level && (
            <div>
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                Education:{" "}
              </span>
              <span className="text-neutral-600 dark:text-neutral-400">
                {job.education_level.name}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Job Meta */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Job Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              Posted:{" "}
            </span>
            <span className="text-neutral-600 dark:text-neutral-400">
              {new Date(job.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          {job.published_at && (
            <div>
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                Published:{" "}
              </span>
              <span className="text-neutral-600 dark:text-neutral-400">
                {new Date(job.published_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          )}

          {job.updated_at && (
            <div>
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                Last Updated:{" "}
              </span>
              <span className="text-neutral-600 dark:text-neutral-400">
                {new Date(job.updated_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          )}

          {job.created_by && (
            <div>
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                Posted By:{" "}
              </span>
              <span className="text-neutral-600 dark:text-neutral-400">
                {job.created_by.email}
              </span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
