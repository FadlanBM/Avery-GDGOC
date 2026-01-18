"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { ActivityItem } from "@/components/activity-item";
import { Button } from "@/components/ui/button";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";
import { Users, Calendar, Briefcase, Clock, ChevronLeft, ChevronRight } from "lucide-react";

interface DashboardContentProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      name?: string;
      full_name?: string;
    };
  };
}

// Mock activities data
const allActivities = [
  {
    id: 1,
    type: "user" as const,
    description: "Alex Thompson applied for Senior React Developer",
    timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    aiPowered: false,
  },
  {
    id: 2,
    type: "ai" as const,
    description: "AI Analysis complete for Candidate #402 - Sarah Jenkin",
    timestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
    aiPowered: true,
  },
  {
    id: 3,
    type: "calendar" as const,
    description: "Interview scheduled with Marcus Chen for tomorrow at 2 PM",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    aiPowered: false,
  },
  {
    id: 4,
    type: "status" as const,
    description: "Emily Rodriguez moved to Interview stage",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    aiPowered: false,
  },
  {
    id: 5,
    type: "user" as const,
    description: "3 new applications received for Product Manager role",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    aiPowered: false,
  },
  {
    id: 6,
    type: "ai" as const,
    description: "AI screening completed for 12 Backend Engineer candidates",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    aiPowered: true,
  },
  {
    id: 7,
    type: "calendar" as const,
    description: "Interview with Jessica Wu completed - Feedback submitted",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    aiPowered: false,
  },
  {
    id: 8,
    type: "user" as const,
    description: "Michael Brown applied for UX Designer position",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    aiPowered: false,
  },
  {
    id: 9,
    type: "status" as const,
    description: "David Kim moved to Final Interview stage",
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10 hours ago
    aiPowered: false,
  },
  {
    id: 10,
    type: "ai" as const,
    description: "AI recommended 5 top candidates for Data Scientist role",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    aiPowered: true,
  },
  {
    id: 11,
    type: "calendar" as const,
    description: "Interview scheduled with Amanda Lee for next Monday at 10 AM",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    aiPowered: false,
  },
  {
    id: 12,
    type: "user" as const,
    description: "Robert Wilson applied for DevOps Engineer",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000), // 1 day 2 hours ago
    aiPowered: false,
  },
  {
    id: 13,
    type: "status" as const,
    description: "Lisa Anderson received job offer - Accepted",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    aiPowered: false,
  },
  {
    id: 14,
    type: "ai" as const,
    description: "AI Analysis identified skill gaps in candidate pool",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 5 * 60 * 60 * 1000), // 2 days 5 hours ago
    aiPowered: true,
  },
  {
    id: 15,
    type: "user" as const,
    description: "7 new applications received for Frontend Developer role",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    aiPowered: false,
  },
];

export default function DashboardContent({ user }: DashboardContentProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  
  // Calculate pagination
  const totalPages = Math.ceil(allActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActivities = allActivities.slice(startIndex, endIndex);
  
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="flex min-h-screen bg-[#F7F8FC] dark:bg-neutral-900">
      {/* Sidebar */}
      <DashboardSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <DashboardHeader user={user} />
        
        {/* Page Content */}
        <main className="flex-1 p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
              Good Evening, {user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0]}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
              Here&apos;s what&apos;s happening with your recruitment pipeline today.
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <MetricCard
            icon={Users}
            iconColor="text-blue-500"
            iconBgColor="bg-blue-50 dark:bg-blue-950"
            label="Total Applicants"
            value="1,240"
            trend={{ direction: "up", value: "+12% vs last month" }}
          />
          <MetricCard
            icon={Calendar}
            iconColor="text-green-500"
            iconBgColor="bg-green-50 dark:bg-green-950"
            label="Interviews Scheduled"
            value="28"
            trend={{ direction: "up", value: "+8 this week" }}
          />
          <MetricCard
            icon={Briefcase}
            iconColor="text-orange-500"
            iconBgColor="bg-orange-50 dark:bg-orange-950"
            label="Open Jobs"
            value="6"
            trend={{ direction: "up", value: "+2 new this month" }}
          />
          <MetricCard
            icon={Clock}
            iconColor="text-purple-500"
            iconBgColor="bg-purple-50 dark:bg-purple-950"
            label="Avg. Time to Hire"
            value="18 days"
            trend={{ direction: "down", value: "-3 days vs last quarter" }}
          />
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {currentActivities.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  type={activity.type}
                  description={activity.description}
                  timestamp={activity.timestamp}
                  aiPowered={activity.aiPowered}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t">
              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <ChevronLeft className="h-4 w-4 -ml-3" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {[1, 2, 3].map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  className={currentPage === page ? "bg-blue-500 hover:bg-blue-600" : ""}
                  onClick={() => goToPage(page)}
                >
                  {page}
                </Button>
              ))}
              
              {totalPages > 5 && <span className="px-2">...</span>}
              
              {totalPages > 3 && (
                <Button
                  variant={currentPage === totalPages ? "default" : "outline"}
                  className={currentPage === totalPages ? "bg-blue-500 hover:bg-blue-600" : ""}
                  onClick={() => goToPage(totalPages)}
                >
                  {totalPages}
                </Button>
              )}

              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
                <ChevronRight className="h-4 w-4 -ml-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
        </main>
      </div>
    </div>
  );
}
