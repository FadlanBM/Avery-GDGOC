"use client";

import { ProfileSection } from "./profile-section";
import { AIPreferencesSection } from "./ai-preferences-section";
import { NotificationsSection } from "./notifications-section";

export function SettingsDrawer() {
  return (
    <main className="flex-1">
      <div className="w-full">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
          Settings
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8">
          Manage your account and AI screening preferences
        </p>

        <div className="space-y-6 w-full">
          <ProfileSection />
          {/* <AIPreferencesSection />
          <NotificationsSection /> */}
        </div>
      </div>
    </main>
  );
}
