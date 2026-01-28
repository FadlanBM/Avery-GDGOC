"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { LucideIcon, Users, Sparkles, Calendar, UserCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ActivityItemProps {
  type: "user" | "ai" | "calendar" | "status"
  description: string
  timestamp: Date
  aiPowered?: boolean
}

const iconMap: Record<string, LucideIcon> = {
  user: Users,
  ai: Sparkles,
  calendar: Calendar,
  status: UserCircle,
}

const iconColorMap: Record<string, string> = {
  user: "text-blue-500",
  ai: "text-purple-500",
  calendar: "text-green-500",
  status: "text-orange-500",
}

const iconBgMap: Record<string, string> = {
  user: "bg-blue-50 dark:bg-blue-950",
  ai: "bg-purple-50 dark:bg-purple-950",
  calendar: "bg-green-50 dark:bg-green-950",
  status: "bg-orange-50 dark:bg-orange-950",
}

export function ActivityItem({
  type,
  description,
  timestamp,
  aiPowered,
}: ActivityItemProps) {
  const [timeAgo, setTimeAgo] = useState<string>(() => 
    formatDistanceToNow(timestamp, { addSuffix: true, locale: localeId })
  );
  const Icon = iconMap[type];
  const iconColor = iconColorMap[type];
  const iconBg = iconBgMap[type];

  useEffect(() => {
    // Update time every minute
    const interval = setInterval(() => {
      setTimeAgo(formatDistanceToNow(timestamp, { addSuffix: true, locale: localeId }));
    }, 60000);

    return () => clearInterval(interval);
  }, [timestamp]);

  return (
    <div className="flex items-start gap-2 lg:gap-3 py-2 lg:py-3">
      <div className={`p-1.5 lg:p-2 rounded-lg ${iconBg} shrink-0`}>
        <Icon className={`h-4 w-4 lg:h-5 lg:w-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs lg:text-sm text-neutral-900 dark:text-neutral-100 leading-relaxed">
          {description}
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1" suppressHydrationWarning>
          {timeAgo}
        </p>
      </div>
      {aiPowered && (
        <Badge variant="blue" className="shrink-0 text-xs px-2 py-1">
          AI
        </Badge>
      )}
    </div>
  );
}
