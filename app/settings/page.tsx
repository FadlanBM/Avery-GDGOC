import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsContainer } from "@/modules/settings";
import DashboardSidebar from "@/components/dashboard-sidebar";
import GuestHeader from "@/components/guest-header";
import { MainContent } from "@/components/main-content";
import LoginPromptModal from "@/components/login-prompt-modal";

function GuestSettingsView() {
  return (
    <div className="flex min-h-screen bg-[#F7F8FC] dark:bg-neutral-900">
      <DashboardSidebar isGuest={true} />
      <MainContent>
        <GuestHeader title="Pengaturan" />
        <main className="flex-1 p-8 mt-16">
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

  return <SettingsContainer user={user} />;
}
