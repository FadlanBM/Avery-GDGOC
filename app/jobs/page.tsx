import { CandidateJobsContainer } from "@/modules/candidate-jobs";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function JobsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check user role - only allow candidates
  const { data: userRole } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", user.id)
    .single();

  // If user is not a candidate, redirect to dashboard
  if (userRole?.roles?.name !== "registrant") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-[#F7F8FC] dark:bg-neutral-900">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col ml-64">
        <DashboardHeader user={user} />
        <main className="flex-1 p-8 mt-16">
          <CandidateJobsContainer />
        </main>
      </div>
    </div>
  );
}
