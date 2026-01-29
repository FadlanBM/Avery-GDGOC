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
    <main className="flex-1 p-4 lg:p-8 mt-16">
      <div className="w-full max-w-6xl mx-auto">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
            Candidate Settings
          </h1>
          <p className="text-sm lg:text-base text-neutral-600 dark:text-neutral-400">
            Manage your profile, experience, education, and CV
          </p>
        </div>

        {/* Tabs Navigation - Mobile Dropdown & Desktop Tabs */}
        <Card className="mb-6">
          {/* Mobile Dropdown */}
          <div className="block lg:hidden p-4">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as TabType)}
              className="w-full p-3 border border-neutral-200 rounded-lg bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#265BFF]"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop Tabs */}
          <div className="hidden lg:flex border-b border-neutral-200 dark:border-neutral-700">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 xl:px-6 py-4 font-medium transition-colors text-sm xl:text-base ${
                    activeTab === tab.id
                      ? "text-[#265BFF] border-b-2 border-[#265BFF]"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
                  }`}
                >
                  <Icon className="h-4 w-4 xl:h-5 xl:w-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Tab Indicator */}
          <div className="block lg:hidden p-4 border-t border-neutral-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              if (tab.id === activeTab) {
                return (
                  <div key={tab.id} className="flex items-center gap-2 text-[#265BFF]">
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </div>
                );
              }
              return null;
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
