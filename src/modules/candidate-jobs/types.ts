export interface Job {
  id: string;
  title: string;
  description: string;
  status: "draft" | "published" | "closed" | "filled";
  created_at: string;
  min_experience_year: number;
  max_experience_year: number;
  no_experience_allowed: boolean;
  employment_status: {
    id: string;
    name: string;
  } | null;
  work_schedule: {
    id: string;
    name: string;
  } | null;
  remote_status: {
    id: string;
    name: string;
  } | null;
  education_level: {
    id: string;
    name: string;
  } | null;
  companie?: {
    id: string;
    name: string;
  } | null;
}

export interface JobApplication {
  id: string;
  job_id: string;
  status: string;
  applied_at: string;
  created_at: string;
  updated_at: string;
  job: Job;
}

export interface JobsResponse {
  status: boolean;
  message: string;
  data: Job[];
  pagination: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
}

export interface ApplicationsResponse {
  status: boolean;
  message: string;
  data: JobApplication[];
  pagination: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
}

export interface JobFilters {
  search?: string;
  employment_status?: string;
  remote_status?: string;
  page?: number;
}
