import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/pagination";
import { WelcomeSection } from "./welcome-section";
import { MetricsGrid } from "./metrics-grid";
import { ActivityList } from "./activity-list";

interface Activity {
  id: number;
  type: "user" | "ai" | "calendar" | "status";
  description: string;
  timestamp: Date;
  aiPowered: boolean;
}

interface DashboardDrawerProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      name?: string;
      full_name?: string;
    };
  };
  currentActivities: Activity[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Drawer({
  user,
  currentActivities,
  currentPage,
  totalPages,
  onPageChange,
}: DashboardDrawerProps) {
  const userName = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  return (
    <main className="flex-1 p-8 mt-16">
      <WelcomeSection userName={userName} />
      
      <MetricsGrid />

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityList activities={currentActivities} />
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            variant="full"
          />
        </CardContent>
      </Card>
    </main>
  );
}
