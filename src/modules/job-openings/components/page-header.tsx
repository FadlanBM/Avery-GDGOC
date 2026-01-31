"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function PageHeader() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-start mb-4 lg:mb-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-50">
          Job Openings
        </h1>
        <p className="text-sm lg:text-base text-neutral-600 dark:text-neutral-400 mt-1">
          Manage your active job postings and view applicants
        </p>
      </div>
      <Button 
        className="bg-[#2563EB] hover:bg-[#1E40AF] text-white w-full lg:w-auto"
        onClick={() => router.push("/job-openings/create")}
      >
        <Plus className="mr-1 h-4 w-4 lg:h-6 lg:w-6" /> Create Job
      </Button>
    </div>
  );
}
