import { MyApplicationsContainer } from "@/modules/my-applications";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";
import MobileNavbar from "@/components/mobile-navbar";
import { MainContent } from "@/components/main-content";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function GuestMyApplicationsView() {
  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-neutral-900">
      <DashboardSidebar isGuest={true} />
      <MobileNavbar title="My Applications" />
      <MainContent>
        <main className="flex-1 p-4 lg:p-8 pt-20 lg:pt-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Lihat Lamaran Anda
              </h2>
              <p className="text-gray-600 mb-8">
                Silakan login untuk melihat status lamaran pekerjaan Anda.
              </p>
              <div className="space-y-4 max-w-md mx-auto">
                <a 
                  href="/login"
                  className="block w-full bg-[#265BFF] hover:bg-[#1E40AF] text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Login sebagai Kandidat
                </a>
                <a 
                  href="/recruiter/login"
                  className="block w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Login sebagai Perusahaan
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
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-neutral-900">
      <DashboardSidebar user={user} isGuest={false} />
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
