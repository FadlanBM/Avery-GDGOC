"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TopJob } from "../types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface TopJobsTableProps {
  data: TopJob[];
  isLoading?: boolean;
}

type SortField = "applicantCount" | "hiredCount" | "avgMatchScore" | "conversionRate";
type SortDirection = "asc" | "desc";

const SortIcon = ({ field, sortField, sortDirection }: { field: SortField; sortField: SortField; sortDirection: SortDirection }) => {
  if (sortField !== field) {
    return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
  }
  return sortDirection === "asc" ? (
    <ArrowUp className="h-4 w-4 ml-1" />
  ) : (
    <ArrowDown className="h-4 w-4 ml-1" />
  );
};

export function TopJobsTable({ data, isLoading }: TopJobsTableProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField>("applicantCount");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const modifier = sortDirection === "asc" ? 1 : -1;
    return (aValue - bValue) * modifier;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Jobs</CardTitle>
        <p className="text-sm text-muted-foreground">
          Jobs ranked by application volume (click to view details)
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 font-semibold text-sm">Job Title</th>
                <th
                  className="text-center py-3 px-2 font-semibold text-sm cursor-pointer hover:bg-muted"
                  onClick={() => handleSort("applicantCount")}
                >
                  <div className="flex items-center justify-center">
                    Applicants
                    <SortIcon field="applicantCount" sortField={sortField} sortDirection={sortDirection} />
                  </div>
                </th>
                <th
                  className="text-center py-3 px-2 font-semibold text-sm cursor-pointer hover:bg-muted"
                  onClick={() => handleSort("avgMatchScore")}
                >
                  <div className="flex items-center justify-center">
                    Avg Match
                    <SortIcon field="avgMatchScore" sortField={sortField} sortDirection={sortDirection} />
                  </div>
                </th>
                <th
                  className="text-center py-3 px-2 font-semibold text-sm cursor-pointer hover:bg-muted"
                  onClick={() => handleSort("hiredCount")}
                >
                  <div className="flex items-center justify-center">
                    Hired
                    <SortIcon field="hiredCount" sortField={sortField} sortDirection={sortDirection} />
                  </div>
                </th>
                <th
                  className="text-center py-3 px-2 font-semibold text-sm cursor-pointer hover:bg-muted"
                  onClick={() => handleSort("conversionRate")}
                >
                  <div className="flex items-center justify-center">
                    Conv. Rate
                    <SortIcon field="conversionRate" sortField={sortField} sortDirection={sortDirection} />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">
                    No job data available
                  </td>
                </tr>
              ) : (
                sortedData.map((job, index) => (
                  <tr
                    key={job.id}
                    className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/job-openings/${job.id}`)}
                  >
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                          {index + 1}
                        </div>
                        <span className="font-medium truncate">{job.title}</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-2 font-semibold">
                      {job.applicantCount}
                    </td>
                    <td className="text-center py-3 px-2">
                      <div className="inline-flex items-center gap-1">
                        <span className="font-semibold">{job.avgMatchScore}%</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-2 font-semibold text-green-600">
                      {job.hiredCount}
                    </td>
                    <td className="text-center py-3 px-2">
                      <div className="inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold text-xs">
                        {job.conversionRate}%
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
