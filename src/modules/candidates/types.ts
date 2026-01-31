export interface Candidate {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  applied_role: string;
  experience: string;
  ai_match: number | null;
  candidate_job_match_id?: string | null;
  asset_id?: string | null;
  status: string;
  applied_date: string;
}
