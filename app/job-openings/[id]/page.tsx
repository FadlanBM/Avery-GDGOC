import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { JobDetailContainer } from "@/modules/job-openings/job-detail";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  const { id } = await params;

  return <JobDetailContainer user={user} jobId={id} />;
}
