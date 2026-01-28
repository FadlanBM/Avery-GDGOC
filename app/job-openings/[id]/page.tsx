import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { JobDetailContainer } from "@/modules/job-openings/job-detail";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";
import MobileNavbar from "@/components/mobile-navbar";
import { MainContent } from "@/components/main-content";

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

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-neutral-900">
      <DashboardSidebar user={user} isGuest={false} />
      <MobileNavbar user={user} title="Job Details" />
      <MainContent>
        <DashboardHeader user={user} className="hidden lg:flex" />
        <main className="flex-1 p-4 lg:p-8 pt-20 lg:pt-24">
          <JobDetailContainer jobId={id} />
        </main>
      </MainContent>
    </div>
  );
}
