export interface Candidate {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  applied_role: string;
  experience: string;
  ai_match: number | null;
  status: string;
  applied_date: string;
}
