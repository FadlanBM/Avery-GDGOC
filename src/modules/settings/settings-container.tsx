"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Drawer } from "./components/drawer";
import { CandidateSettingsDrawer } from "./candidate-settings-drawer";
import { Skeleton } from "@/components/ui/skeleton";

interface SettingsContainerProps {}

export default function SettingsContainer() {
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
    <>      
      {loading ? (
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="space-y-4">
            <div className="h-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-48 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      ) : userRole === "registrant" ? (
        <CandidateSettingsDrawer />
      ) : (
        <Drawer />
      )}
    </>
  );
}
