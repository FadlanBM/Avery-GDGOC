"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface Candidate {
  id: string;
  name: string;
  email: string;
  applied_role: string;
  experience: string;
  ai_match: number;
  status: string;
  applied_date: string;
}

interface CandidatesTableProps {
  candidates: Candidate[];
}

export function CandidatesTable({ candidates }: CandidatesTableProps) {
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
    console.log("Candidate detail - will implement after design reference:", candidate);
  };

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-700">
              <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Candidate
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Applied Role
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Experience
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                AI Match
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Status
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
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
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100">

                    </div>
                    {/* <Image
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=265BFF&color=fff&size=40`}
                      alt={candidate.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full"
                    /> */}
                    <div>
                      <div className="font-medium text-neutral-900 dark:text-neutral-50">
                        {candidate.name}
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        {candidate.email}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Applied Role Column */}
                <td className="py-4 px-4 text-neutral-700 dark:text-neutral-300">
                  {candidate.applied_role}
                </td>

                {/* Experience Column */}
                <td className="py-4 px-4 text-neutral-700 dark:text-neutral-300">
                  {candidate.experience}
                </td>

                {/* AI Match Column */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getAIMatchColor(candidate.ai_match)}`}
                        style={{ width: `${candidate.ai_match}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      {candidate.ai_match}%
                    </span>
                  </div>
                </td>

                {/* Status Column */}
                <td className="py-4 px-4">
                  <Badge
                    className={`${getStatusColor(candidate.status)} rounded-full border-0 font-normal`}
                  >
                    {candidate.status}
                  </Badge>
                </td>

                {/* Applied Date Column */}
                <td className="py-4 px-4 text-neutral-700 dark:text-neutral-300">
                  {formatDate(candidate.applied_date)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden grid grid-cols-1 gap-4 p-4">
        {candidates.map((candidate) => (
          <Card
            key={candidate.id}
            onClick={() => handleRowClick(candidate)}
            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-100">

                    </div>
                    {/* <Image
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=265BFF&color=fff&size=40`}
                      alt={candidate.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full"
                    /> */}
              <div className="flex-1">
                <div className="font-medium text-neutral-900 dark:text-neutral-50 mb-1">
                  {candidate.name}
                </div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                  {candidate.email}
                </div>
                <Badge
                  className={`${getStatusColor(candidate.status)} rounded-full border-0 font-normal text-xs`}
                >
                  {candidate.status}
                </Badge>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Role:</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-50">
                  {candidate.applied_role}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Experience:</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-50">
                  {candidate.experience}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-600 dark:text-neutral-400">AI Match:</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getAIMatchColor(candidate.ai_match)}`}
                      style={{ width: `${candidate.ai_match}%` }}
                    />
                  </div>
                  <span className="font-medium text-neutral-900 dark:text-neutral-50">
                    {candidate.ai_match}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Applied:</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-50">
                  {formatDate(candidate.applied_date)}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
