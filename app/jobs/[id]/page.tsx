import { JobDetailContainer } from "@/modules/candidate-jobs/job-detail";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";
import MobileNavbar from "@/components/mobile-navbar";
import GuestHeader from "@/components/guest-header";
import { MainContent } from "@/components/main-content";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { validateUserRole } from "@/lib/validations/auth-check";

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
    const roleValidation = await validateUserRole(
      supabase,
      user.id,
      "recruiter",
    );
    // If user is a candidate (registrant), redirect to jobs page
    if (!roleValidation.isValid) {
      redirect("/dashboard");
    }

    // Authenticated candidate view
    return (
      <div className="min-h-screen bg-[#F7F8FC] dark:bg-neutral-900">
        <DashboardSidebar isGuest={false} />
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

  // Guest mode view
  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-neutral-900">
      <GuestHeader title="Detail Pekerjaan" />
      <DashboardSidebar isGuest={true} />
      <MobileNavbar title="Job Details" />
      <MainContent>
        <main className="flex-1 p-4 lg:p-8 pt-20 lg:pt-24">
          <JobDetailContainer jobId={id} />
        </main>
      </MainContent>
    </div>
  );
}
