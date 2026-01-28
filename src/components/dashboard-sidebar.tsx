"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Briefcase, FileText, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSidebar } from "@/lib/sidebar-context";
import { Button } from "@/components/ui/button";

interface DashboardSidebarProps {
  user?: {
    name: string;
    role: string;
    email: string;
    avatar: string;
  } | null;
  isGuest?: boolean;
}

export default function DashboardSidebar({ user, isGuest = false }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, toggleSidebar, closeMobile } = useSidebar();
  
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
    // If guest mode, skip API call and set to candidate role
    if (isGuest) {
      setUserRole("registrant");
      setIsLoading(false);
      return;
    }

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
  }, [isGuest]);

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
      <aside className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white border-r transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center px-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#265BFF] rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              {!isCollapsed && <h2 className="text-xl font-bold text-gray-900">TalentAI</h2>}
            </div>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {/* Loading skeleton */}
            {[...Array(4)].map((_, i) => (
              <div key={i} className={cn(
                "h-11 bg-gray-100 rounded-lg animate-pulse",
                isCollapsed ? "w-12" : "w-full"
              )} />
            ))}
          </nav>
        </div>
      </aside>
    );
  }

  return (
    <>
      {/* Mobile/Tablet Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={closeMobile}
        />
      )}
      
      {/* Sidebar - Hidden on mobile/tablet, overlay when hamburger clicked */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-screen bg-white border-r transition-all duration-300",
        // Desktop only - normal sidebar behavior
        "hidden lg:block",
        isCollapsed ? "lg:w-20" : "lg:w-64",
        // Mobile overlay when hamburger opened
        isMobileOpen && "lg:hidden block w-64"
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#265BFF] rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <h2 className="text-xl font-bold text-gray-900">TalentAI</h2>
              )}
            </div>
            
            {/* Mobile close button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="lg:hidden"
              onClick={closeMobile}
            >
              <X className="h-4 w-4" />
            </Button>
            
            {/* Desktop collapse button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden lg:flex"
              onClick={toggleSidebar}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {menuItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={index}
                  href={item.href}
                  onClick={closeMobile}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-gray-100",
                    isActive
                      ? "bg-[#265BFF] text-white hover:bg-[#1E40AF]"
                      : "text-gray-700 hover:text-gray-900",
                    isCollapsed && "lg:justify-center"
                  )}
                >
                  {item.icon}
                  {(!isCollapsed || isMobileOpen) && (
                    <span className="truncate">{item.title}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
