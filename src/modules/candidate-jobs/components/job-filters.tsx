"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function JobFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const searchValue = searchParams.get("search") || "";
  const [search, setSearch] = useState(searchValue);

  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.set("page", "1"); // Reset to first page
    router.push(`/jobs?${params.toString()}`);
  };

  const clearFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.set("page", "1");
    router.push(`/jobs?${params.toString()}`);
    
    if (key === "search") {
      setSearch("");
    }
  };

  const clearAllFilters = () => {
    router.push("/jobs");
    setSearch("");
  };

  const activeFilters = Array.from(searchParams.entries()).filter(
    ([key]) => key !== "page" && key !== "limit"
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      {/* <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <Input
          type="text"
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 bg-gray-100 dark:bg-neutral-800 border-0 focus-visible:ring-[#265BFF]"
        />
      </div> */}

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            Active filters:
          </span>
          {activeFilters.map(([key, value]) => (
            <Badge
              key={key}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <span className="capitalize">{key}:</span>
              <span>{value}</span>
              <X
                className="h-3 w-3 cursor-pointer hover:text-red-500"
                onClick={() => clearFilter(key)}
              />
            </Badge>
          ))}
          <button
            onClick={clearAllFilters}
            className="text-sm text-[#265BFF] hover:text-[#1E40AF] font-medium"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
