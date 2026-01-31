import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  variant?: "simple" | "full";
  showFirstLast?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  variant = "full",
  showFirstLast = true,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const renderSimplePagination = () => (
    <div className="flex items-center justify-center lg:justify-end gap-2 mt-6 lg:mt-8">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8 lg:h-9 lg:w-9 disabled:opacity-50"
      >
        <ChevronLeft className="h-3 w-3 lg:h-4 lg:w-4" />
      </Button>
      
      <div className="flex gap-1">
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const page = i + 1;
          if (totalPages <= 5) {
            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="icon"
                onClick={() => onPageChange(page)}
                className={`h-8 w-8 lg:h-9 lg:w-9 text-xs lg:text-sm ${
                  currentPage === page
                    ? "bg-[#2563EB] hover:bg-[#1E40AF] text-white"
                    : ""
                }`}
              >
                {page}
              </Button>
            );
          }
          
          // Show current page and 2 pages around it on mobile
          const showPage = Math.abs(currentPage - page) <= 1 || page === 1 || page === totalPages;
          if (!showPage) return null;
          
          return (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="icon"
              onClick={() => onPageChange(page)}
              className={`h-8 w-8 lg:h-9 lg:w-9 text-xs lg:text-sm ${
                currentPage === page
                  ? "bg-[#2563EB] hover:bg-[#1E40AF] text-white"
                  : ""
              }`}
            >
              {page}
            </Button>
          );
        })}
      </div>
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8 lg:h-9 lg:w-9 disabled:opacity-50"
      >
        <ChevronRight className="h-3 w-3 lg:h-4 lg:w-4" />
      </Button>
    </div>
  );

  const renderFullPagination = () => (
    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-2 mt-4 lg:mt-6 pt-4 lg:pt-6 border-t">
      {/* Mobile: Simple prev/next with page info */}
      <div className="sm:hidden flex items-center gap-2 mb-2">
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          Page {currentPage} of {totalPages}
        </span>
      </div>
      
      <div className="flex items-center gap-1 lg:gap-2">
        {showFirstLast && totalPages > 5 && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="h-8 w-8 lg:h-9 lg:w-9 hidden sm:flex"
          >
            <ChevronLeft className="h-3 w-3 lg:h-4 lg:w-4" />
            <ChevronLeft className="h-3 w-3 lg:h-4 lg:w-4 -ml-2 lg:-ml-3" />
          </Button>
        )}
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 lg:h-9 lg:w-9"
        >
          <ChevronLeft className="h-3 w-3 lg:h-4 lg:w-4" />
        </Button>
        
        {/* Desktop: Show page numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {[1, 2, 3].map((page) => {
            if (page > totalPages) return null;
            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="icon"
                className={`h-8 w-8 lg:h-9 lg:w-9 text-xs lg:text-sm ${
                  currentPage === page ? "bg-[#265BFF] hover:bg-[#1E4ED8]" : ""
                }`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            );
          })}
          
          {totalPages > 5 && <span className="px-2 text-neutral-400">...</span>}
          
          {totalPages > 3 && (
            <Button
              variant={currentPage === totalPages ? "default" : "outline"}
              size="icon"
              className={`h-8 w-8 lg:h-9 lg:w-9 text-xs lg:text-sm ${
                currentPage === totalPages ? "bg-[#265BFF] hover:bg-[#1E4ED8]" : ""
              }`}
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 lg:h-9 lg:w-9"
        >
          <ChevronRight className="h-3 w-3 lg:h-4 lg:w-4" />
        </Button>
        
        {showFirstLast && totalPages > 5 && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 lg:h-9 lg:w-9 hidden sm:flex"
          >
            <ChevronRight className="h-3 w-3 lg:h-4 lg:w-4" />
            <ChevronRight className="h-3 w-3 lg:h-4 lg:w-4 -ml-2 lg:-ml-3" />
          </Button>
        )}
      </div>
    </div>
  );

  return variant === "simple" ? renderSimplePagination() : renderFullPagination();
}
