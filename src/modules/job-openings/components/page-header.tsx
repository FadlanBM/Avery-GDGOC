"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function PageHeader() {
  const router = useRouter();

  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
          Job Openings
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Manage your active job postings and view applicants
        </p>
      </div>
      <Button 
        className="bg-[#2563EB] hover:bg-[#1E40AF] text-white"
        onClick={() => router.push("/job-openings/create")}
      >
        <Plus className="mr-1 h-6 w-6" /> Create Job
      </Button>
    </div>
  );
}
