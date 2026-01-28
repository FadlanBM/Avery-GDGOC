"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogIn, Building2 } from "lucide-react";

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export default function LoginPromptModal({
  isOpen,
  onClose,
  title = "Login Diperlukan",
  description = "Untuk menggunakan fitur ini, silakan login terlebih dahulu.",
}: LoginPromptModalProps) {
  const router = useRouter();

  const handleCandidateLogin = () => {
    onClose();
    router.push("/login");
  };

  const handleRecruiterLogin = () => {
    onClose();
    router.push("/recruiter/login");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5 text-[#265BFF]" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          <Button 
            onClick={handleCandidateLogin}
            className="w-full bg-[#265BFF] hover:bg-[#1E40AF] text-white"
            size="lg"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Login sebagai Kandidat
          </Button>
          
          <Button 
            onClick={handleRecruiterLogin}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Building2 className="mr-2 h-4 w-4" />
            Login sebagai Perusahaan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
