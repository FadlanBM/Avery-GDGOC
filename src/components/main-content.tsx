"use client";

import { useSidebar } from "@/lib/sidebar-context";
import { cn } from "@/lib/utils";
import { is } from "date-fns/locale";
import { ReactNode } from "react";
import { usePathname } from 'next/navigation';

interface MainContentProps {
  children: ReactNode;
  className?: string;
}

export function MainContent({ children, className }: MainContentProps) {
  const { isCollapsed } = useSidebar();
  const pathname = usePathname();
  const isCandidate = pathname.includes('/candidate');
  return (
    <div className={cn(
      "flex-1 flex flex-col transition-all duration-300",
      // Desktop only: sidebar margin
      "ml-0 lg:ml-0",
      isCollapsed ? "lg:ml-20" : isCandidate ? "lg:-ml-30" : "lg:ml-64",
      className
    )}>
      {children}
    </div>
  );
}
