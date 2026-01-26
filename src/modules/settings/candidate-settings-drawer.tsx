"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CandidatePersonalInfo } from "./components/candidate-personal-info";
import { CandidateWorkExperience } from "./components/candidate-work-experience";
import { CandidateEducation } from "./components/candidate-education";
import { CandidateCV } from "./components/candidate-cv";
import { User, Briefcase, GraduationCap, FileText } from "lucide-react";

type TabType = "personal" | "experience" | "education" | "cv";

export function CandidateSettingsDrawer() {
  const [activeTab, setActiveTab] = useState<TabType>("personal");

  const tabs = [
    { id: "personal" as TabType, label: "Personal Info", icon: User },
    { id: "experience" as TabType, label: "Work Experience", icon: Briefcase },
    { id: "education" as TabType, label: "Education", icon: GraduationCap },
    { id: "cv" as TabType, label: "CV Management", icon: FileText },
  ];

  return (
    <main className="flex-1 p-8 mt-16">
      <div className="w-full max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
          Candidate Settings
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8">
          Manage your profile, experience, education, and CV
        </p>

        {/* Tabs Navigation */}
        <Card className="mb-6">
          <div className="flex border-b border-neutral-200 dark:border-neutral-700">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.id
                      ? "text-[#265BFF] border-b-2 border-[#265BFF]"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "personal" && <CandidatePersonalInfo />}
          {activeTab === "experience" && <CandidateWorkExperience />}
          {activeTab === "education" && <CandidateEducation />}
          {activeTab === "cv" && <CandidateCV />}
        </div>
      </div>
    </main>
  );
}
