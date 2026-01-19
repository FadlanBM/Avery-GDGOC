import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JobOpeningsContainer } from "@/modules/job-openings";

export default async function JobOpeningsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <JobOpeningsContainer user={user} />;
}
