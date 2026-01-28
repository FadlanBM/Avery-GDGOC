"use client";

import { useSidebar } from "@/lib/sidebar-context";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MainContentProps {
  children: ReactNode;
  className?: string;
}

export function MainContent({ children, className }: MainContentProps) {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className={cn(
      "flex-1 flex flex-col transition-all duration-300",
      // Desktop only: sidebar margin
      "ml-0 lg:ml-0",
      isCollapsed ? "lg:ml-20" : "lg:ml-64",
      className
    )}>
      {children}
    </div>
  );
}
