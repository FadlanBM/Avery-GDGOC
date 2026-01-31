import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardContainer } from "@/modules/dashboard";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";
import MobileNavbar from "@/components/mobile-navbar";
import { MainContent } from "@/components/main-content";
import { validateUserRole } from "@/lib/validations/auth-check";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // If user is a candidate (registrant), redirect to jobs page
  const roleValidation = await validateUserRole(supabase, user.id, "recruiter");
  // If user is a candidate (registrant), redirect to jobs page
  if (!roleValidation.isValid) {
    redirect("/jobs");
  }

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-neutral-900">
      <DashboardSidebar isGuest={false} />
      <MobileNavbar user={user} title="Dashboard" />
      <MainContent>
        <DashboardHeader user={user} className="hidden lg:flex" />
        <main className="flex-1 p-4 lg:p-8 pt-20 lg:pt-24">
          <DashboardContainer user={user} />
        </main>
      </MainContent>
    </div>
  );
}
