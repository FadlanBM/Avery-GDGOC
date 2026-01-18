"use client";

import DashboardSidebar from "@/components/dashboard-sidebar";

export default function SettingsContent() {
  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <DashboardSidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-4">
          Settings
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Settings content coming soon...
        </p>
      </div>
    </div>
  );
}
