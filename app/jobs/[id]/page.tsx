import { JobDetailContainer } from "@/modules/candidate-jobs/job-detail";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";
import GuestHeader from "@/components/guest-header";
import { MainContent } from "@/components/main-content";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { id } = await params;

  // If user is authenticated, check their role
  if (user) {
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("roles(name)")
      .eq("user_id", user.id)
      .single();

    // If user is not a candidate, redirect to dashboard
    if (userRole?.roles?.name !== "registrant") {
      redirect("/dashboard");
    }

    // Authenticated candidate view
    return (
      <div className="flex min-h-screen bg-[#F7F8FC] dark:bg-neutral-900">
        <DashboardSidebar />
        <MainContent>
          <DashboardHeader user={user} />
          <main className="flex-1 p-8 mt-16">
            <JobDetailContainer jobId={id} isGuest={false} />
          </main>
        </MainContent>
      </div>
    );
  }

  // Guest mode view
  return (
    <div className="flex min-h-screen bg-[#F7F8FC] dark:bg-neutral-900">
      <DashboardSidebar isGuest={true} />
      <MainContent>
        <GuestHeader title="Detail Pekerjaan" />
        <main className="flex-1 p-8 mt-16">
          <JobDetailContainer jobId={id} isGuest={true} />
        </main>
      </MainContent>
    </div>
  );
}
