"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { jobFormSchema, type JobFormData } from "@/lib/validations/job";

interface DropdownOption {
  id: string;
  name: string;
}

interface SubDataResponse {
  status: boolean;
  message: string;
  data?: DropdownOption[];
}

export function JobForm() {
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [employmentStatusId, setEmploymentStatusId] = useState<string>("");
  const [workScheduleId, setWorkScheduleId] = useState<string>("");
  const [remoteStatusId, setRemoteStatusId] = useState<string>("");
  const [requiredEducationId, setRequiredEducationId] = useState<string>("");
  const [minExperienceYears, setMinExperienceYears] = useState<string>("");
  const [maxExperienceYears, setMaxExperienceYears] = useState<string>("");
  const [noExperienceAllowed, setNoExperienceAllowed] = useState(false);

  // Dropdown data state
  const [educationLevels, setEducationLevels] = useState<DropdownOption[]>([]);
  const [employmentStatuses, setEmploymentStatuses] = useState<DropdownOption[]>([]);
  const [remoteStatuses, setRemoteStatuses] = useState<DropdownOption[]>([]);
  const [workSchedules, setWorkSchedules] = useState<DropdownOption[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Fetch dropdown data on mount
  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    setFetchingData(true);
    setError(null);

    try {
      const [educationRes, employmentRes, remoteRes, scheduleRes] = await Promise.all([
        axios.get<SubDataResponse>("/api/education"),
        axios.get<SubDataResponse>("/api/employment-status"),
        axios.get<SubDataResponse>("/api/remote-status"),
        axios.get<SubDataResponse>("/api/workschedule"),
      ]);

      setEducationLevels(educationRes.data.data || []);
      setEmploymentStatuses(employmentRes.data.data || []);
      setRemoteStatuses(remoteRes.data.data || []);
      setWorkSchedules(scheduleRes.data.data || []);
    } catch (err) {
      setError("Failed to load dropdown data. Please try again.");
      console.error("Error fetching dropdown data:", err);
    } finally {
      setFetchingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});
    setLoading(true);

    try {
      // Prepare form data
      const formData: JobFormData = {
        title,
        description,
        employment_status_id: employmentStatusId || null,
        work_schedule_id: workScheduleId,
        remote_status_id: remoteStatusId,
        required_education_id: requiredEducationId || null,
        min_experience_year: minExperienceYears ? parseInt(minExperienceYears) : 0,
        max_experience_year: maxExperienceYears ? parseInt(maxExperienceYears) : 0,
        no_experience_allowed: noExperienceAllowed,
        status: "published",
      };

      // Validate with Zod schema
      const validatedData = jobFormSchema.parse(formData);

      console.log("Sending job data to API:", validatedData);

      // Submit to API
      const response = await axios.post("/api/job", validatedData);

      console.log("API Response:", response.data);

      if (response.data.status) {
        router.push("/job-openings");
      } else {
        setError(response.data.message || "Failed to create job opening");
      }
    } catch (err: unknown) {
      console.error("Submit error:", err);
      if (err && typeof err === 'object' && 'name' in err && err.name === "ZodError" && 'errors' in err) {
        // Handle Zod validation errors
        const errors: Record<string, string> = {};
        const zodError = err as unknown as { errors: Array<{ path: Array<string | number>; message: string }> };
        zodError.errors.forEach((error) => {
          const path = error.path.join(".");
          errors[path] = error.message;
        });
        setValidationErrors(errors);
      } else if (axios.isAxiosError(err)) {
        console.error("Axios error details:", err.response?.data);
        setError(err.response?.data?.message || "Failed to create job opening");
        if (err.response?.data?.error) {
          console.error("Backend validation errors:", err.response.data.error);
        }
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if required dropdowns are empty
  const isRequiredDropdownEmpty = workSchedules.length === 0 || remoteStatuses.length === 0;
  const canSubmit = !loading && !fetchingData && !isRequiredDropdownEmpty;

  return (
    <div className="max-w-6xl mx-auto">
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
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
          Create New Job Opening
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Fill out the form below to create a new job opening
        </p>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>
            Provide information about the job position
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {isRequiredDropdownEmpty && !fetchingData && (
              <div className="flex items-center gap-2 p-3 text-sm text-orange-600 bg-orange-50 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span>
                  {workSchedules.length === 0 && "Work Schedule data is empty. "}
                  {remoteStatuses.length === 0 && "Remote Status data is empty. "}
                  Please contact administrator.
                </span>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Job Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Developer"
                disabled={loading || fetchingData}
              />
              {validationErrors.title && (
                <p className="text-sm text-destructive">{validationErrors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Job Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe responsibilities, qualifications, and benefits..."
                disabled={loading || fetchingData}
                className="min-h-30"
              />
              {validationErrors.description && (
                <p className="text-sm text-destructive">{validationErrors.description}</p>
              )}
            </div>

            {/* Work Schedule */}
            <div className="space-y-2">
              <Label htmlFor="work-schedule">
                Work Schedule <span className="text-destructive">*</span>
              </Label>
              {fetchingData ? (
                <div className="h-10 bg-muted animate-pulse rounded-md" />
              ) : (
                <Select
                  value={workScheduleId}
                  onValueChange={setWorkScheduleId}
                  disabled={loading || workSchedules.length === 0}
                >
                  <SelectTrigger id="work-schedule">
                    <SelectValue placeholder="Select work schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    {workSchedules.map((schedule) => (
                      <SelectItem key={schedule.id} value={schedule.id}>
                        {schedule.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {validationErrors.work_schedule_id && (
                <p className="text-sm text-destructive">{validationErrors.work_schedule_id}</p>
              )}
            </div>

            {/* Remote Status */}
            <div className="space-y-2">
              <Label htmlFor="remote-status">
                Remote Status <span className="text-destructive">*</span>
              </Label>
              {fetchingData ? (
                <div className="h-10 bg-muted animate-pulse rounded-md" />
              ) : (
                <Select
                  value={remoteStatusId}
                  onValueChange={setRemoteStatusId}
                  disabled={loading || remoteStatuses.length === 0}
                >
                  <SelectTrigger id="remote-status">
                    <SelectValue placeholder="Select remote status" />
                  </SelectTrigger>
                  <SelectContent>
                    {remoteStatuses.map((status) => (
                      <SelectItem key={status.id} value={status.id}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {validationErrors.remote_status_id && (
                <p className="text-sm text-destructive">{validationErrors.remote_status_id}</p>
              )}
            </div>

            {/* Employment Status */}
            <div className="space-y-2">
              <Label htmlFor="employment-status">Employment Status</Label>
              {fetchingData ? (
                <div className="h-10 bg-muted animate-pulse rounded-md" />
              ) : (
                <Select
                  value={employmentStatusId}
                  onValueChange={setEmploymentStatusId}
                  disabled={loading || employmentStatuses.length === 0}
                >
                  <SelectTrigger id="employment-status">
                    <SelectValue placeholder="Select employment status (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {employmentStatuses.map((status) => (
                      <SelectItem key={status.id} value={status.id}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Required Education */}
            <div className="space-y-2">
              <Label htmlFor="education">Minimum Education</Label>
              {fetchingData ? (
                <div className="h-10 bg-muted animate-pulse rounded-md" />
              ) : (
                <Select
                  value={requiredEducationId}
                  onValueChange={setRequiredEducationId}
                  disabled={loading || educationLevels.length === 0}
                >
                  <SelectTrigger id="education">
                    <SelectValue placeholder="Select minimum education (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {educationLevels.map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* No Experience Allowed Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="no-experience"
                checked={noExperienceAllowed}
                onCheckedChange={(checked) => {
                  setNoExperienceAllowed(checked as boolean);
                  if (checked) {
                    setMinExperienceYears("");
                    setMaxExperienceYears("");
                  }
                }}
                disabled={loading || fetchingData}
              />
              <Label
                htmlFor="no-experience"
                className="text-sm font-normal cursor-pointer"
              >
                No experience required (fresh graduate)
              </Label>
            </div>

            {/* Experience Years */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-experience">Minimum Experience (years)</Label>
                <Input
                  id="min-experience"
                  type="number"
                  min="0"
                  value={minExperienceYears}
                  onChange={(e) => setMinExperienceYears(e.target.value)}
                  placeholder="e.g. 2"
                  disabled={loading || fetchingData || noExperienceAllowed}
                />
                {validationErrors.min_experience_years && (
                  <p className="text-sm text-destructive">{validationErrors.min_experience_years}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-experience">Maximum Experience (years)</Label>
                <Input
                  id="max-experience"
                  type="number"
                  min="0"
                  value={maxExperienceYears}
                  onChange={(e) => setMaxExperienceYears(e.target.value)}
                  placeholder="e.g. 5"
                  disabled={loading || fetchingData || noExperienceAllowed}
                />
                {validationErrors.max_experience_years && (
                  <p className="text-sm text-destructive">{validationErrors.max_experience_years}</p>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Job
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
