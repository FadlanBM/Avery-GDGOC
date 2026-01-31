"use client";

import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/lib/sidebar-context";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface MobileNavbarProps {
  user?: {
    id: string;
    email?: string;
    user_metadata?: {
      name?: string;
      full_name?: string;
    };
  };
  title?: string;
}

export default function MobileNavbar({ user, title = "TalentAI" }: MobileNavbarProps) {
  const { toggleMobile } = useSidebar();
  const router = useRouter();

  const userName = user?.user_metadata?.name || 
                   user?.user_metadata?.full_name || 
                   user?.email?.split("@")[0] || 
                   "Guest";
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
    <nav className="lg:hidden fixed top-0 left-0 right-0 z-30 h-16 bg-white border-b flex items-center justify-between px-4">
      {/* Hamburger Menu */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={toggleMobile}
        className="p-2"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Title */}
      <h1 className="text-lg font-bold text-gray-900">{title}</h1>

      {/* User Profile */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#265BFF] flex items-center justify-center text-white font-semibold text-sm">
          {initials}
        </div>
        {user && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLogout}
            className="p-2"
          >
            <LogOut className="h-5 w-5 text-gray-600" />
          </Button>
        )}
      </div>
    </nav>
  );
}