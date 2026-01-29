import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, XCircle, Users, X, ArrowUpDown, Check } from "lucide-react";
import { CandidatesTable } from "./candidates-table";
import { Pagination } from "@/components/pagination";
import { CandidateDetailDrawer } from "./candidate-detail-drawer";
import { Candidate } from "../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SortOption = "ai_match" | "newest" | "oldest" | "unanalyzed";

interface DrawerProps {
  candidates: Candidate[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalCandidates: number;
  statusFilter?: string;
  onPageChange: (page: number) => void;
  onRetry: () => void;
}

export function Drawer({
  candidates,
  loading,
  error,
  currentPage,
  totalPages,
  totalCandidates,
  statusFilter,
  onPageChange,
  onRetry,
}: DrawerProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const handleCandidateClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedCandidate(null);
  };

  const handleClearFilter = () => {
    window.location.href = "/candidates";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      applied: "Applied",
      screening: "Screening",
      interview: "Interview",
      offer: "Offer",
      hired: "Hired",
    };
    return labels[status.toLowerCase()] || status;
  };

  const getSortLabel = (sort: SortOption) => {
    const labels: Record<SortOption, string> = {
      ai_match: "AI Match Score",
      newest: "Newest",
      oldest: "Oldest",
      unanalyzed: "Unanalyzed",
    };
    return labels[sort];
  };

  // Filter candidates if "unanalyzed" is selected
  const filteredCandidates = sortBy === "unanalyzed" 
    ? candidates.filter(c => !c.ai_match || c.ai_match === 0)
    : candidates;

  // Sort candidates based on selected option
  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    switch (sortBy) {
      case "ai_match":
        // Sort by AI match score (highest to lowest)
        return (b.ai_match || 0) - (a.ai_match || 0);
      case "newest":
      case "unanalyzed": // Unanalyzed also sorts by newest
        // Sort by applied date (newest first)
        return new Date(b.applied_date).getTime() - new Date(a.applied_date).getTime();
      case "oldest":
        // Sort by applied date (oldest first)
        return new Date(a.applied_date).getTime() - new Date(b.applied_date).getTime();
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 lg:mb-6">
          <div className="h-6 lg:h-8 bg-gray-200 rounded animate-pulse mb-2 w-48" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-96" />
        </div>
        <Card className="p-4 lg:p-6">
          <div className="h-12 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="h-12 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="h-12 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="h-12 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="h-12 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="h-12 bg-gray-200 rounded animate-pulse" />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card className="p-6 lg:p-8 text-center">
          <XCircle className="h-10 lg:h-12 w-10 lg:w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Candidates</h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">{error}</p>
          <Button onClick={onRetry} variant="outline">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card className="p-6 lg:p-8 text-center">
          <Users className="h-10 lg:h-12 w-10 lg:w-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Candidates Found</h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            No candidates have applied yet.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-4 lg:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-1">
              All Candidates
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {totalCandidates} candidates with AI-powered screening insights
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <ArrowUpDown className="h-4 w-4" />
                <span className="hidden sm:inline">Sort by:</span>
                <span>{getSortLabel(sortBy)}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setSortBy("ai_match")}>
                <div className="flex items-center justify-between w-full">
                  <span>AI Match Score</span>
                  {sortBy === "ai_match" && <Check className="h-4 w-4" />}
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("newest")}>
                <div className="flex items-center justify-between w-full">
                  <span>Newest</span>
                  {sortBy === "newest" && <Check className="h-4 w-4" />}
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("oldest")}>
                <div className="flex items-center justify-between w-full">
                  <span>Oldest</span>
                  {sortBy === "oldest" && <Check className="h-4 w-4" />}
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("unanalyzed")}>
                <div className="flex items-center justify-between w-full">
                  <span>Unanalyzed</span>
                  {sortBy === "unanalyzed" && <Check className="h-4 w-4" />}
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Status Filter Badge */}
        {statusFilter && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filtered by:</span>
            <Badge variant="secondary" className="flex items-center gap-2">
              {getStatusLabel(statusFilter)}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={handleClearFilter}
              />
            </Badge>
          </div>
        )}
      </div>

      {/* Table Card */}
      <Card className="border-0 shadow-sm bg-white dark:bg-neutral-800 mb-6">
        <CandidatesTable candidates={sortedCandidates} onCandidateClick={handleCandidateClick} />
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            variant="simple"
            showFirstLast={false}
          />
        </div>
      )}

      {/* Candidate Detail Drawer */}
      <CandidateDetailDrawer
        candidate={selectedCandidate}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}
