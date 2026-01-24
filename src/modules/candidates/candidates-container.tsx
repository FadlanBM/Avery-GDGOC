"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";
import { Drawer } from "./components/drawer";

interface CandidatesContainerProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      name?: string;
      full_name?: string;
    };
  };
}

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

export default function CandidatesContainer({ user }: CandidatesContainerProps) {
  const searchParams = useSearchParams();
  const statusFilter = searchParams?.get("status") || "";
  
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const itemsPerPage = 6;

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `/api/candidates?page=${currentPage}&limit=${itemsPerPage}`;
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      
      const response = await axios.get(url);
      
      if (response.data.status) {
        let fetchedCandidates = response.data.data || [];
        
        // Client-side filtering if API doesn't support status filter
        if (statusFilter && fetchedCandidates.length > 0) {
          fetchedCandidates = fetchedCandidates.filter(
            (c: Candidate) => c.status.toLowerCase() === statusFilter.toLowerCase()
          );
        }
        
        setCandidates(fetchedCandidates);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalCandidates(response.data.pagination?.totalCandidates || 0);
      } else {
        setError(response.data.message || "Failed to load candidates");
      }
    } catch (err: any) {
      console.error("Error fetching candidates:", err);
      setError(err.response?.data?.message || "Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [currentPage, statusFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRetry = () => {
    fetchCandidates();
  };

  return (
    <div className="flex min-h-screen bg-[#F7F8FC] dark:bg-neutral-900">
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col ml-64">
        <DashboardHeader user={user} />
        
        <Drawer 
          candidates={candidates}
          loading={loading}
          error={error}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCandidates={totalCandidates}
          statusFilter={statusFilter}
          onPageChange={handlePageChange}
          onRetry={handleRetry}
        />
      </div>
    </div>
  );
}
