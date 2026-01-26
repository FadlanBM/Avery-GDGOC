"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Briefcase, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

interface DashboardSidebarProps {
  user?: {
    name: string;
    role: string;
    email: string;
    avatar: string;
  } | null;
}

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  
  // Detect initial role from current pathname to avoid flicker
  const getInitialRole = () => {
    if (pathname.startsWith("/jobs") || pathname.startsWith("/my-applications")) {
      return "registrant";
    }
    return null;
  };
  
  const [userRole, setUserRole] = useState<string | null>(getInitialRole);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch user role to determine menu items
    const fetchUserRole = async () => {
      try {
        const response = await axios.get("/api/auth/me");
        if (response.data.status && response.data.data?.role) {
          setUserRole(response.data.data.role);
        } else {
          setUserRole("recruiter");
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        // Default to recruiter menu if error
        setUserRole("recruiter");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  // Menu items for recruiters
  const recruiterMenuItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      title: "Job Openings",
      href: "/job-openings",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "Candidates",
      href: "/candidates",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: "Settings",
      href: "/settings",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  // Menu items for candidates (registrants)
  const candidateMenuItems = [
    {
      title: "Find Jobs",
      href: "/jobs",
      icon: <Briefcase className="w-5 h-5" />,
    },
    {
      title: "My Applications",
      href: "/my-applications",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  // Determine which menu items to show based on role
  const menuItems = userRole === "registrant" ? candidateMenuItems : recruiterMenuItems;

  // Show loading skeleton or empty while fetching role
  if (isLoading && !userRole) {
    return (
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center px-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#265BFF] rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">TalentAI</h2>
            </div>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {/* Loading skeleton */}
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-11 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </nav>
        </div>
      </aside>
    );
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#265BFF] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">TalentAI</h2>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#265BFF] text-white font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {item.icon}
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
