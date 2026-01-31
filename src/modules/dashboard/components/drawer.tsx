import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/pagination";
import { WelcomeSection } from "./welcome-section";
import { MetricsGrid } from "./metrics-grid";
import { ActivityList } from "./activity-list";
import { ActivityListSkeleton } from "./activity-skeleton";
import { DashboardMetrics, Activity } from "../types";

interface DashboardDrawerProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      name?: string;
      full_name?: string;
    };
  };
  metrics?: DashboardMetrics;
  activities: Activity[];
  currentPage: number;
  totalPages: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
}

export function Drawer({
  user,
  metrics,
  activities,
  currentPage,
  totalPages,
  isLoading,
  onPageChange,
}: DashboardDrawerProps) {
  const userName = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  return (
    <>
      <WelcomeSection userName={userName} />
      
      <MetricsGrid metrics={metrics} isLoading={isLoading} />

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ActivityListSkeleton count={7} />
          ) : (
            <>
              {activities.length > 0 ? (
                <ActivityList activities={activities} />
              ) : (
                <div className="py-8 text-center text-neutral-500 dark:text-neutral-400">
                  No activities yet
                </div>
              )}
            </>
          )}
          
          {!isLoading && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              variant="full"
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
