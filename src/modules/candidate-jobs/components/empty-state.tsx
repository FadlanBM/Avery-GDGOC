"use client";

import { Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export function EmptyState({ hasFilters = false, onClearFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-neutral-100 dark:bg-neutral-800 p-6 mb-6">
        <Briefcase className="h-12 w-12 text-neutral-400 dark:text-neutral-600" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
        {hasFilters ? "No jobs found" : "No jobs available"}
      </h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center max-w-md mb-6">
        {hasFilters
          ? "Try adjusting your filters or search terms to find more opportunities."
          : "There are currently no job openings available. Please check back later."}
      </p>
      {hasFilters && onClearFilters && (
        <Button
          onClick={onClearFilters}
          variant="outline"
          className="border-[#265BFF] text-[#265BFF] hover:bg-[#265BFF] hover:text-white"
        >
          Clear Filters
        </Button>
      )}
    </div>
  );
}
