"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Bell, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useSidebar } from "@/lib/sidebar-context";
import { cn } from "@/lib/utils";
import axios from "axios";

// Configuration for routes that need search
const SEARCH_CONFIG: Record<string, { placeholder: string; paramName: string }> = {
  "/job-openings": { placeholder: "Cari lowongan...", paramName: "search" },
  "/candidates": { placeholder: "Cari kandidat...", paramName: "search" },
  "/jobs": { placeholder: "Cari pekerjaan...", paramName: "search" },
  "/my-applications": { placeholder: "Cari lamaran...", paramName: "search" },
};

interface DashboardHeaderProps {
  user?: {
    id: string;
    email?: string;
    user_metadata?: {
      name?: string;
      full_name?: string;
    };
  };
}

interface UserProfileData {
  fullname: string;
  email: string;
  position: string;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isCollapsed } = useSidebar();
  
  const [searchValue, setSearchValue] = useState("");
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  
  // Get search config for current route
  const searchConfig = SEARCH_CONFIG[pathname];
  const showSearch = !!searchConfig;

  // Sync search value with URL params when pathname changes (reset on route change)
  useEffect(() => {
    if (searchConfig) {
      const currentSearch = searchParams.get(searchConfig.paramName) || "";
      setSearchValue(currentSearch);
    } else {
      setSearchValue("");
    }
  }, [pathname, searchParams, searchConfig]);

  // Fetch user profile data from API
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // First determine user role to choose the correct API endpoint
        let apiEndpoint = "/api/auth-recruiter/me"; // default
        
        try {
          const roleResponse = await axios.get("/api/auth/me");
          if (roleResponse.data.status && roleResponse.data.data?.role === "registrant") {
            apiEndpoint = "/api/auth-candidate/me";
          }
        } catch (roleError) {
          console.log("Could not determine role, defaulting to recruiter API");
        }

        const response = await axios.get(apiEndpoint);
        if (response.data.status) {
          setProfileData({
            fullname: response.data.data.fullname,
            email: response.data.data.email,
            position: response.data.data.position || "Candidate",
          });
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        // Fallback to user prop data if API fails
      }
    };

    if (user?.id) {
      fetchUserProfile();
    }
  }, [user?.id]);

  // Debounced search handler
  const updateSearchParams = useCallback(
    (value: string) => {
      if (!searchConfig) return;
      
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set(searchConfig.paramName, value.trim());
      } else {
        params.delete(searchConfig.paramName);
      }
      params.set("page", "1"); // Reset to first page on search
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, searchParams, searchConfig, router]
  );

  // Debounce effect
  useEffect(() => {
    if (!searchConfig) return;
    
    const currentUrlSearch = searchParams.get(searchConfig.paramName) || "";
    
    // Only trigger if value differs from URL
    if (searchValue !== currentUrlSearch) {
      const timer = setTimeout(() => {
        updateSearchParams(searchValue);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [searchValue, searchConfig, searchParams, updateSearchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  // Use profile data from API if available, otherwise fallback to user prop
  const userName = profileData?.fullname || 
                   user?.user_metadata?.name || 
                   user?.user_metadata?.full_name || 
                   user?.email?.split("@")[0] || 
                   "User";
  const userEmail = profileData?.email || user?.email || "";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/jobs");
    router.refresh();
  };

  return (
    <header 
      className={cn(
        "fixed top-0 right-0 z-30 h-16 border-b bg-white flex items-center justify-between px-8 transition-all duration-300",
        isCollapsed ? "left-20" : "left-64"
      )}
    >
      {showSearch ? (
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={searchConfig.placeholder}
              value={searchValue}
              onChange={handleSearchChange}
              className="pl-10 bg-gray-100 border-0 focus-visible:ring-1 focus-visible:ring-[#265BFF] focus-visible:ring-offset-0"
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 max-w-md" />
      )}

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#265BFF] rounded-full"></span>
        </Button>

        <div className="flex items-center gap-3 pl-4 border-l">
          <div className="w-10 h-10 rounded-full bg-[#265BFF] flex items-center justify-center text-white font-semibold">
            {initials}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500">{userEmail}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:text-red-600 hover:bg-red-50"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut className="h-5 w-5 text-gray-600" />
        </Button>
      </div>
    </header>
  );
}
