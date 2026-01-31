import { createClient } from "@/lib/supabase/server";
import { SettingsContainer } from "@/modules/settings";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";
import MobileNavbar from "@/components/mobile-navbar";
import GuestHeader from "@/components/guest-header";
import { MainContent } from "@/components/main-content";

function GuestSettingsView() {
  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-neutral-900">
      <GuestHeader title="Pengaturan" />
      <DashboardSidebar isGuest={true} />
      <MobileNavbar title="Settings" />
      <MainContent>
        <main className="flex-1 p-4 lg:p-8 pt-20 lg:pt-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Akses Pengaturan
              </h2>
              <p className="text-gray-600 mb-8">
                Silakan login untuk mengakses pengaturan akun Anda.
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

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <GuestSettingsView />;
  }

  // Authenticated user view
  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-neutral-900">
      <DashboardSidebar isGuest={false} />
      <MobileNavbar user={user} title="Settings" />
      <MainContent>
        <DashboardHeader user={user} className="hidden lg:flex" />
        <main className="flex-1 p-4 lg:p-8 pt-20 lg:pt-24">
          <SettingsContainer />
        </main>
      </MainContent>
    </div>
  );
}
