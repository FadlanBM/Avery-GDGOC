"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";
import { MainContent } from "@/components/main-content";
import { Drawer } from "./components/drawer";
import { CandidateSettingsDrawer } from "./candidate-settings-drawer";
import { Skeleton } from "@/components/ui/skeleton";

interface SettingsContainerProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      name?: string;
      full_name?: string;
    };
  };
}

export default function SettingsContainer({ user }: SettingsContainerProps) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await axios.get("/api/auth/me");
        if (response.data.status && response.data.data) {
          setUserRole(response.data.data.role);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F7F8FC] dark:bg-neutral-900">
      <DashboardSidebar />
      
      <MainContent>
        <DashboardHeader user={user} />
        
        {loading ? (
          <main className="flex-1 p-8 mt-16">
            <Skeleton className="h-10 w-64 mb-4" />
            <Skeleton className="h-6 w-96 mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </main>
        ) : userRole === "registrant" ? (
          <CandidateSettingsDrawer />
        ) : (
          <Drawer />
        )}
      </MainContent>
    </div>
  );
}
