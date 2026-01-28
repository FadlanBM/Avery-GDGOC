"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface GuestHeaderProps {
  title?: string;
}

export default function GuestHeader({ title = "Cari Pekerjaan" }: GuestHeaderProps) {
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-16 border-b bg-white flex items-center justify-between px-8">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            asChild
          >
            <Link href="/login">
              Login sebagai Kandidat
            </Link>
          </Button>
          
          <Button 
            size="sm" 
            asChild
          >
            <Link href="/recruiter/login">
              Login sebagai Perusahaan
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
