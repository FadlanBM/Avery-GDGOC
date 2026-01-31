"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Candidate } from "../types";

interface CandidatesTableProps {
  candidates: Candidate[];
  onCandidateClick: (candidate: Candidate) => void;
}

export function CandidatesTable({ candidates, onCandidateClick }: CandidatesTableProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "interview":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "screening":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
      case "new":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      case "rejected":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-neutral-100 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300";
    }
  };

  const getAIMatchColor = (match: number) => {
    if (match > 90) return "bg-green-500";
    if (match >= 70) return "bg-orange-500";
    return "bg-red-500";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleRowClick = (candidate: Candidate) => {
    onCandidateClick(candidate);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-200 dark:border-neutral-700">
            <th className="text-left py-3 px-2 lg:px-4 text-xs lg:text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Candidate
            </th>
            <th className="text-left py-3 px-2 lg:px-4 text-xs lg:text-sm font-medium text-neutral-600 dark:text-neutral-400 hidden sm:table-cell">
              Applied Role
            </th>
            <th className="text-left py-3 px-2 lg:px-4 text-xs lg:text-sm font-medium text-neutral-600 dark:text-neutral-400 hidden md:table-cell">
              Experience
            </th>
            <th className="text-left py-3 px-2 lg:px-4 text-xs lg:text-sm font-medium text-neutral-600 dark:text-neutral-400 hidden lg:table-cell">
              AI Match
            </th>
            <th className="text-left py-3 px-2 lg:px-4 text-xs lg:text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Status
            </th>
            <th className="text-left py-3 px-2 lg:px-4 text-xs lg:text-sm font-medium text-neutral-600 dark:text-neutral-400 hidden lg:table-cell">
              Applied
            </th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate) => (
            <tr
              key={candidate.id}
              onClick={() => handleRowClick(candidate)}
              className="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 cursor-pointer transition-colors"
            >
              {/* Candidate Column */}
              <td className="py-3 lg:py-4 px-2 lg:px-4">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[#265BFF] flex items-center justify-center text-white text-xs lg:text-sm font-medium">
                    {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-neutral-900 dark:text-neutral-50 text-sm lg:text-base truncate">
                      {candidate.name}
                    </div>
                    <div className="text-xs lg:text-sm text-neutral-500 dark:text-neutral-400 truncate">
                      {candidate.email}
                    </div>
                    {/* Show role on mobile when Applied Role column is hidden */}
                    <div className="text-xs text-neutral-600 dark:text-neutral-400 sm:hidden mt-1 truncate">
                      {candidate.applied_role}
                    </div>
                  </div>
                </div>
              </td>

              {/* Applied Role Column - Hidden on mobile */}
              <td className="py-3 lg:py-4 px-2 lg:px-4 text-sm lg:text-base text-neutral-700 dark:text-neutral-300 hidden sm:table-cell">
                <div className="truncate">{candidate.applied_role}</div>
              </td>

              {/* Experience Column - Hidden on mobile and small tablets */}
              <td className="py-3 lg:py-4 px-2 lg:px-4 text-sm lg:text-base text-neutral-700 dark:text-neutral-300 hidden md:table-cell">
                {candidate.experience}
              </td>

              {/* AI Match Score Column - Hidden on mobile and tablets */}
              <td className="py-3 lg:py-4 px-2 lg:px-4 hidden lg:table-cell">
                {candidate.ai_match && candidate.ai_match > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 max-w-[100px]">
                      <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getAIMatchColor(candidate.ai_match)} transition-all`}
                          style={{ width: `${candidate.ai_match}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 min-w-[3ch]">
                      {candidate.ai_match}%
                    </span>
                  </div>
                ) : (
                  <Badge className="bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border-0 text-xs">
                    Not analyzed
                  </Badge>
                )}
              </td>

              {/* Status Column */}
              <td className="py-3 lg:py-4 px-2 lg:px-4">
                <Badge
                  className={`${getStatusColor(candidate.status)} rounded-full border-0 font-normal text-xs`}
                >
                  {candidate.status}
                </Badge>
              </td>

              {/* Applied Date Column - Hidden on mobile and tablets */}
              <td className="py-3 lg:py-4 px-2 lg:px-4 text-sm lg:text-base text-neutral-700 dark:text-neutral-300 hidden lg:table-cell">
                {formatDate(candidate.applied_date)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
