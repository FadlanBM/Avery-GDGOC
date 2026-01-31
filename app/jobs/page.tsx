import { CandidateJobsContainer } from "@/modules/candidate-jobs";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";
import MobileNavbar from "@/components/mobile-navbar";
import GuestHeader from "@/components/guest-header";
import { MainContent } from "@/components/main-content";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { validateUserRole } from "@/lib/validations/auth-check";

export default async function JobsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is authenticated, check their role
  if (user) {
    const roleValidation = await validateUserRole(
      supabase,
      user.id,
      "registrant",
    );

    // If user is not a candidate, redirect to dashboard
    if (!roleValidation.isValid) {
      redirect("/dashboard");
    }

    // Authenticated candidate view
    return (
      <div className="min-h-screen bg-[#F7F8FC] dark:bg-neutral-900">
        <DashboardSidebar isGuest={false} />
        <MobileNavbar user={user} title="Find Jobs" />
        <MainContent>
          <DashboardHeader user={user} className="hidden lg:flex" />
          <main className="flex-1 p-4 lg:p-8 pt-20 lg:pt-24">
            <CandidateJobsContainer isGuest={false} />
          </main>
        </MainContent>
      </div>
    );
  }

  // Guest mode view
  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-neutral-900">
      <GuestHeader title="Cari Pekerjaan" />
      <DashboardSidebar isGuest={true} />
      <MobileNavbar title="Find Jobs" />
      <MainContent>
        <main className="flex-1 p-4 lg:p-8 pt-20 lg:pt-24">
          <CandidateJobsContainer isGuest={true} />
        </main>
      </MainContent>
    </div>
  );
}
