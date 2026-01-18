"use client";

import { Search, Bell, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter();
  const userName = user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const userRole = "HR Recruiter";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="fixed top-0 right-0 z-30 h-16 border-b bg-white flex items-center justify-between px-8" style={{ left: '16rem' }}>
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search candidates, jobs..."
            className="pl-10 bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-[#265BFF] focus-visible:ring-offset-0"
          />
        </div>
      </div>

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
            <p className="text-xs text-gray-500">{userRole}</p>
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
