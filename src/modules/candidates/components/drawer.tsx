import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, XCircle, Users } from "lucide-react";
import { CandidatesTable } from "./candidates-table";
import { Pagination } from "@/components/pagination";
import { CandidateDetailDrawer } from "./candidate-detail-drawer";

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

interface DrawerProps {
  candidates: Candidate[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalCandidates: number;
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
  onPageChange,
  onRetry,
}: DrawerProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleCandidateClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedCandidate(null);
  };

  if (loading) {
    return (
      <main className="flex-1 p-8 mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Card className="p-6">
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-12 w-full" />
          </Card>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 p-8 mt-16">
        <div className="max-w-7xl mx-auto">
          <Card className="p-8 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Candidates</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">{error}</p>
            <Button onClick={onRetry} variant="outline">
              Retry
            </Button>
          </Card>
        </div>
      </main>
    );
  }

  if (candidates.length === 0) {
    return (
      <main className="flex-1 p-8 mt-16">
        <div className="max-w-7xl mx-auto">
          <Card className="p-8 text-center">
            <Users className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Candidates Found</h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              No candidates have applied yet.
            </p>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8 mt-16">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-1">
                All Candidates
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {totalCandidates} candidates with AI-powered screening insights
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <span>Filter</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Table Card */}
        <Card className="border-0 shadow-sm bg-white dark:bg-neutral-800">
          <CandidatesTable candidates={candidates} onCandidateClick={handleCandidateClick} />
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
    </main>
  );
}
