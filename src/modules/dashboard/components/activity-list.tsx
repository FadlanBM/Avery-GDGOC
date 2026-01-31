import { ActivityItem } from "@/components/activity-item";
import { Activity } from "../types";

interface ActivityListProps {
  activities: Activity[];
}


export function ActivityList({ activities }: ActivityListProps) {
  return (
    <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
      {activities.map((activity) => (
        <ActivityItem
          key={activity.id}
          type={activity.type}
          description={activity.description}
          timestamp={activity.timestamp}
          aiPowered={activity.aiPowered}
        />
      ))}
    </div>
  );
}
