import { MyApplicationsContainer } from "@/modules/my-applications";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";
import MobileNavbar from "@/components/mobile-navbar";
import GuestHeader from "@/components/guest-header";
import { MainContent } from "@/components/main-content";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { validateUserRole } from "@/lib/validations/auth-check";

function GuestMyApplicationsView() {
  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-neutral-900">
      <GuestHeader title="Lamaran Saya" />
      <DashboardSidebar isGuest={true} />
      <MobileNavbar title="My Applications" />
      <MainContent>
        <main className="flex-1 p-4 lg:p-8 pt-20 lg:pt-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                View Your Applications
              </h2>
              <p className="text-gray-600 mb-8">
                Please login to view the status of your job applications.
              </p>
              <div className="space-y-4 max-w-md mx-auto">
                <a
                  href="/login"
                  className="block w-full bg-[#265BFF] hover:bg-[#1E40AF] text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Login for candidates
                </a>
                <a
                  href="/recruiter/login"
                  className="block w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Login for recruiters
                </a>
              </div>
            </div>
          </div>
        </main>
      </MainContent>
    </div>
  );
}

export default async function MyApplicationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <GuestMyApplicationsView />;
  }

  // Check user role - only allow candidates
  const roleValidation = await validateUserRole(
    supabase,
    user.id,
    "registrant",
  );

  // If user is not a candidate, redirect to dashboard
  if (!roleValidation.isValid) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-neutral-900">
      <DashboardSidebar isGuest={false} />
      <MobileNavbar user={user} title="My Applications" />
      <MainContent>
        <DashboardHeader user={user} className="hidden lg:flex" />
        <main className="flex-1 p-4 lg:p-8 pt-20 lg:pt-24">
          <MyApplicationsContainer />
        </main>
      </MainContent>
    </div>
  );
}
