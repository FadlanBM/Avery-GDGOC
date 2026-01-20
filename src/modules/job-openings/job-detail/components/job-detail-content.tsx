"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { AlertCircle, ArrowLeft, Briefcase, Calendar, Clock, GraduationCap, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface JobData {
  id: string;
  title: string;
  description: string;
  status: string;
  min_experience_years: number | null;
  max_experience_years: number | null;
  no_experience_allowed: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  employment_status: { id: string; name: string } | null;
  work_schedule: { id: string; name: string } | null;
  remote_status: { id: string; name: string } | null;
  education_level: { id: string; name: string } | null;
  companie: { id: string; name: string } | null;
  created_by: { id: string; email: string } | null;
}

interface JobDetailContentProps {
  jobId: string;
}

export function JobDetailContent({ jobId }: JobDetailContentProps) {
  const router = useRouter();
  const [job, setJob] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobDetail();
  }, [jobId]);

  const fetchJobDetail = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/job/${jobId}`);
      
      if (response.data.status) {
        setJob(response.data.data);
      } else {
        setError(response.data.message || "Failed to load job details");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to load job details");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "closed":
        return "bg-red-100 text-red-800";
      case "filled":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getExperienceText = () => {
    if (job?.no_experience_allowed) {
      return "No experience required (Fresh Graduate)";
    }
    if (job?.min_experience_years !== null && job?.max_experience_years !== null) {
      return `${job.min_experience_years} - ${job.max_experience_years} years`;
    }
    if (job?.min_experience_years !== null) {
      return `Minimum ${job.min_experience_years} years`;
    }
    if (job?.max_experience_years !== null) {
      return `Maximum ${job.max_experience_years} years`;
    }
    return "Not specified";
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Skeleton className="h-10 w-24 mb-4" />
          <Skeleton className="h-10 w-96 mb-2" />
          <Skeleton className="h-6 w-64" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-5xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span>{error || "Job not found"}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
              {job.title}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
              {job.companie?.name || "Company Name"}
            </p>
          </div>
          <Badge className={getStatusColor(job.status)}>
            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                {job.description}
              </p>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Education */}
              {job.education_level && (
                <div className="flex items-start gap-3">
                  <GraduationCap className="h-5 w-5 text-neutral-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-50">
                      Education
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {job.education_level.name}
                    </p>
                  </div>
                </div>
              )}

              {/* Experience */}
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-neutral-500 mt-0.5" />
                <div>
                  <p className="font-medium text-neutral-900 dark:text-neutral-50">
                    Experience
                  </p>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {getExperienceText()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Work Schedule */}
              {job.work_schedule && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-neutral-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-neutral-500">Work Schedule</p>
                    <p className="font-medium text-neutral-900 dark:text-neutral-50">
                      {job.work_schedule.name}
                    </p>
                  </div>
                </div>
              )}

              {/* Remote Status */}
              {job.remote_status && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-neutral-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-neutral-500">Remote Status</p>
                    <p className="font-medium text-neutral-900 dark:text-neutral-50">
                      {job.remote_status.name}
                    </p>
                  </div>
                </div>
              )}

              {/* Employment Status */}
              {job.employment_status && (
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-neutral-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-neutral-500">Employment Type</p>
                    <p className="font-medium text-neutral-900 dark:text-neutral-50">
                      {job.employment_status.name}
                    </p>
                  </div>
                </div>
              )}

              {/* Posted Date */}
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-neutral-500 mt-0.5" />
                <div>
                  <p className="text-sm text-neutral-500">Posted On</p>
                  <p className="font-medium text-neutral-900 dark:text-neutral-50">
                    {formatDate(job.published_at || job.created_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                Edit Job
              </Button>
              <Button className="w-full" variant="outline">
                View Applications
              </Button>
              <Button className="w-full" variant="destructive">
                Close Job
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
