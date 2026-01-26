"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function JobListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="p-6 rounded-lg shadow-sm">
          <div className="space-y-4">
            {/* Header */}
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>

            {/* Details */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Badges */}
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
