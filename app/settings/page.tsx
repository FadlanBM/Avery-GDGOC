import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardSidebar from "@/components/dashboard-sidebar";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen">
      <DashboardSidebar user={user} />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
            Settings
          </h1>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">
            Coming soon...
          </p>
        </div>
      </main>
    </div>
  );
}
