import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JobOpeningsContent } from "@/modules/job-openings";

export default async function JobOpeningsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <JobOpeningsContent />;
}
