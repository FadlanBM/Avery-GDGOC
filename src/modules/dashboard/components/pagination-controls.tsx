import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  return (
    <div className="flex items-center justify-end gap-2 mt-6 pt-6 border-t">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        <ChevronLeft className="h-4 w-4 -ml-3" />
      </Button>
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
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
        <ChevronRight className="h-4 w-4 -ml-3" />
      </Button>
    </div>
  );
}
