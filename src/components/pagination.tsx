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
    <div className="flex items-center justify-end gap-2 mt-8">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-9 w-9 disabled:opacity-50"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="icon"
            onClick={() => onPageChange(page)}
            className={`h-9 w-9 ${
              currentPage === page
                ? "bg-[#2563EB] hover:bg-[#1E40AF] text-white"
                : ""
            }`}
          >
            {page}
          </Button>
        ))}
      </div>
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-9 w-9 disabled:opacity-50"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );

  const renderFullPagination = () => (
    <div className="flex items-center justify-end gap-2 mt-6 pt-6 border-t">
      {showFirstLast && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          <ChevronLeft className="h-4 w-4 -ml-3" />
        </Button>
      )}
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {[1, 2, 3].map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          className={currentPage === page ? "bg-[#265BFF] hover:bg-[#1E4ED8]" : ""}
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}
      
      {totalPages > 5 && <span className="px-2">...</span>}
      
      {totalPages > 3 && (
        <Button
          variant={currentPage === totalPages ? "default" : "outline"}
          className={currentPage === totalPages ? "bg-[#265BFF] hover:bg-[#1E4ED8]" : ""}
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </Button>
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      
      {showFirstLast && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
          <ChevronRight className="h-4 w-4 -ml-3" />
        </Button>
      )}
    </div>
  );

  return variant === "simple" ? renderSimplePagination() : renderFullPagination();
}
