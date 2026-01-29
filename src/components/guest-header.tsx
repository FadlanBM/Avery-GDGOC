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
    <header className="fixed top-0 left-0 right-0 z-30 h-16 border-b bg-white flex items-center justify-end px-4 lg:px-8">

      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          asChild
          className="hidden sm:inline-flex"
        >
          <Link href="/login">
            Login Kandidat
          </Link>
        </Button>
        
        <Button 
          size="sm" 
          asChild
          className="hidden sm:inline-flex"
        >
          <Link href="/recruiter/login">
            Login Perusahaan
          </Link>
        </Button>

        {/* Mobile menu button */}
        <div className="sm:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/login')}
          >
            Login
          </Button>
        </div>
      </div>
    </header>
  );
}
