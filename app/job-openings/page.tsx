import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JobOpeningsContainer } from "@/modules/job-openings";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";
import MobileNavbar from "@/components/mobile-navbar";
import { MainContent } from "@/components/main-content";

export default async function JobOpeningsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check user role - only allow recruiters
  const { data: userRole } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", user.id)
    .single();

  // If user is a candidate (registrant), redirect to jobs page
  if (userRole?.roles?.name === "registrant") {
    redirect("/jobs");
  }

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-neutral-900">
      <DashboardSidebar user={user} isGuest={false} />
      <MobileNavbar user={user} title="Job Openings" />
      <MainContent>
        <DashboardHeader user={user} className="hidden lg:flex" />
        <main className="flex-1 p-4 lg:p-8 pt-20 lg:pt-24">
          <JobOpeningsContainer />
        </main>
      </MainContent>
    </div>
  );
}
