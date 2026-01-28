"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import axiosSupabase from "@/lib/axios-supabase";
import { toast } from "sonner";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Clock,
  GraduationCap,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Job } from "../../types";

interface JobDetailContentProps {
  jobId: string;
}

export function JobDetailContent({ jobId }: JobDetailContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [job, setJob] = useState<Job | null>(null);
  const [isApplied, setIsApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const fetchJobDetail = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch job detail
      const jobResponse = await axiosSupabase.get(`/api/candidate/job?id=${jobId}`);
      
      if (jobResponse.data.status && jobResponse.data.data.length > 0) {
        setJob(jobResponse.data.data[0]);

        // Check if already applied
        const applicationsResponse = await axiosSupabase.get(
          "/api/candidate/job-application?limit=1000"
        );
        
        if (applicationsResponse.data.status) {
          const applied = applicationsResponse.data.data.some(
            (app: { job_id: string }) => app.job_id === jobId
          );
          setIsApplied(applied);
        }
      } else {
        setError("Job not found");
      }
    } catch (err) {
      console.error("Error fetching job detail:", err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to load job details");
      } else {
        setError("An error occurred while loading job details");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);

    try {
      const response = await axiosSupabase.post("/api/candidate/job-application", {
        job_id: jobId,
      });

      if (response.data.status) {
        toast.success("Application submitted successfully!", {
          description: "You will be notified about the next steps.",
        });
        
        // Redirect to my applications
        setTimeout(() => {
          router.push("/my-applications");
        }, 1500);
      }
    } catch (err) {
      console.error("Error applying for job:", err);
      if (axios.isAxiosError(err)) {
        toast.error("Failed to submit application", {
          description: err.response?.data?.message || "Please try again later.",
        });
      } else {
        toast.error("An error occurred", {
          description: "Please try again later.",
        });
      }
    } finally {
      setApplying(false);
    }
  };

  const handleBack = () => {
    // Preserve filters when going back
    const params = searchParams.toString();
    router.push(params ? `/jobs?${params}` : "/jobs");
  };

  const formatExperience = () => {
    if (!job) return "";
    if (job.no_experience_allowed) {
      return "No experience required";
    }
    if (job.min_experience_year === 0 && job.max_experience_year === 0) {
      return "Experience not specified";
    }
    if (job.min_experience_year === job.max_experience_year) {
      return `${job.min_experience_year} years of experience`;
    }
    return `${job.min_experience_year}-${job.max_experience_year} years of experience`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" className="gap-2" disabled>
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Button>

        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" className="gap-2" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Button>

        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
                {error || "Job Not Found"}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                The job you&apos;re looking for might have been removed or doesn&apos;t exist.
              </p>
              <Button onClick={handleBack} variant="outline">
                Back to Jobs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
        onClick={handleBack}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Button>

      {/* Job Detail Card */}
      <Card>
        <CardHeader className="border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
              {job.companie && (
                <p className="text-lg text-neutral-600 dark:text-neutral-400">
                  {job.companie.name}
                </p>
              )}
            </div>
            {isApplied && (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Already Applied
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Job Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {job.companie && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Company
                  </p>
                  <p className="font-medium text-neutral-900 dark:text-neutral-50">
                    {job.companie.name}
                  </p>
                </div>
              </div>
            )}

            {job.employment_status && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <Briefcase className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Employment Type
                  </p>
                  <p className="font-medium text-neutral-900 dark:text-neutral-50">
                    {job.employment_status.name}
                  </p>
                </div>
              </div>
            )}

            {job.work_schedule && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                  <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Work Schedule
                  </p>
                  <p className="font-medium text-neutral-900 dark:text-neutral-50">
                    {job.work_schedule.name}
                  </p>
                </div>
              </div>
            )}

            {job.education_level && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Education
                  </p>
                  <p className="font-medium text-neutral-900 dark:text-neutral-50">
                    {job.education_level.name}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {job.remote_status && (
              <Badge variant="secondary">{job.remote_status.name}</Badge>
            )}
            <Badge variant="secondary">{formatExperience()}</Badge>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              Job Description
            </h3>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                {job.description}
              </p>
            </div>
          </div>

          {/* Apply Button */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <Button
              onClick={handleApply}
              disabled={isApplied || applying}
              className="bg-[#265BFF] hover:bg-[#1E40AF] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              {applying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting Application...
                </>
              ) : isApplied ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Already Applied
                </>
              ) : (
                "Apply Now"
              )}
            </Button>
            {!isApplied && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                Your profile information will be submitted with this application.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
