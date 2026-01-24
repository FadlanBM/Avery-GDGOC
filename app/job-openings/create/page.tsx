import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CreateJobContainer } from "@/modules/job-openings/create-job";

export default async function CreateJobPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/recruiter/login");
  }

  const user = {
    id: session.user.id,
    email: session.user.email,
    user_metadata: session.user.user_metadata,
  };

  return <CreateJobContainer user={user} />;
}
