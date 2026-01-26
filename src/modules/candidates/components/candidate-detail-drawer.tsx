"use client";

import { useState, useEffect } from "react";
import { X, Mail, MapPin, FileText, Download, Sparkles, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Image from "next/image";

interface Candidate {
  id: string;
  name: string;
  email: string;
  applied_role: string;
  experience: string;
  ai_match: number;
  status: string;
  applied_date: string;
  user_id?: string;
}

interface CandidateCV {
  id: string;
  file_name: string;
  file_url: string;
  is_primary: boolean;
}

interface CandidateDetailDrawerProps {
  candidate: Candidate | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CandidateDetailDrawer({ candidate, isOpen, onClose }: CandidateDetailDrawerProps) {
  const [cvData, setCvData] = useState<CandidateCV | null>(null);
  const [isLoadingCV, setIsLoadingCV] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (isOpen && candidate?.user_id) {
      fetchCandidateCV(candidate.user_id);
    } else {
      setCvData(null);
    }
  }, [isOpen, candidate?.user_id]);

  const fetchCandidateCV = async (userId: string) => {
    setIsLoadingCV(true);
    try {
      const response = await fetch(`/api/candidate/cv?user_id=${userId}`);
      if (response.ok) {
        const result = await response.json();
        // Get primary CV or first CV
        const cvs = result.data || [];
        const primaryCV = cvs.find((cv: CandidateCV) => cv.is_primary) || cvs[0];
        setCvData(primaryCV || null);
      }
    } catch (error) {
      console.error("Error fetching CV:", error);
    } finally {
      setIsLoadingCV(false);
    }
  };

  const handleDownloadCV = async () => {
    if (!cvData?.file_url) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(cvData.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = cvData.file_name || "CV.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading CV:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen || !candidate) return null;

  // Mock data for candidate details
  const candidateDetails = {
    location: "Austin, TX",
    skills: ["React", "JavaScript", "Python", "Docker", "PostgreSQL"],
    aiAnalysis: `${candidate.name.split(" ")[0]} brings ${candidate.experience} of full-stack development experience with a strong focus on React. He has successfully delivered enterprise-scale applications and shows excellent problem-solving abilities. His background includes performance optimization work that reduced load times by 60% at his previous company.`,
    whyTheyFit: [
      "Extensive enterprise experience",
      "Strong full-stack capabilities",
      "Proven track record of performance optimization",
    ],
    missingRequirements: [
      "TypeScript experience is more recent",
      "No direct team leadership experience",
    ],
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[680px] bg-white dark:bg-neutral-900 shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 p-6 flex items-center justify-between z-999">
          <div className="flex items-center gap-3">
            {/* <Image
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=265BFF&color=fff&size=48`}
              alt={candidate.name}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full"
            /> */}
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
                {candidate.name}
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {candidate.applied_role}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Contact Info */}
          <div className="flex flex-row items-center space-x-6">
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <Mail className="h-4 w-4" />
              <span>{candidate.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <MapPin className="h-4 w-4" />
              <span>{candidateDetails.location}</span>
            </div>
          </div>

          <div className="flex flex-row space-x-4">
            {/* Resume/CV Section */}
          <Card className="p-4 bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 w-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Resume / CV
              </h3>
            </div>
            <div className="bg-neutral-100 dark:bg-neutral-700 rounded-lg p-6 mb-3 flex items-center justify-center">
              {isLoadingCV ? (
                <Loader2 className="h-16 w-16 text-neutral-400 dark:text-neutral-500 animate-spin" />
              ) : (
                <FileText className="h-16 w-16 text-neutral-400 dark:text-neutral-500" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                {cvData ? cvData.file_name : "No CV uploaded"}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={handleDownloadCV}
                disabled={!cvData || isDownloading || isLoadingCV}
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {isDownloading ? "Downloading..." : "Download PDF"}
              </Button>
            </div>
          </Card>

          {/* AI Match Score */}
          <Card className="p-4 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 w-full">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-blue-600" />
              AI Match Score
            </h3>
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 mb-3">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-neutral-200 dark:text-neutral-700"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - candidate.ai_match / 100)}`}
                    className="text-green-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                    {candidate.ai_match}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
                Excellent match for this role
              </p>
            </div>
          </Card>

          </div>
          
          {/* AI Analysis Summary */}
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-blue-600" />
              AI Analysis Summary
            </h3>
            <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {candidateDetails.aiAnalysis}
            </p>
          </div>

          {/* Key Skills */}
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 mb-3">
              Key Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {candidateDetails.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-0 px-3 py-1"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Why They Fit & Missing Requirements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Why They Fit */}
            <Card className="p-4 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
              <h3 className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5" />
                Why They Fit
              </h3>
              <ul className="space-y-2">
                {candidateDetails.whyTheyFit.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300"
                  >
                    <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Missing Requirements */}
            <Card className="p-4 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
              <h3 className="font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5" />
                Missing Requirements
              </h3>
              <ul className="space-y-2">
                {candidateDetails.missingRequirements.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300"
                  >
                    <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Schedule Interview Button */}
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
              <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
              <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
              <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
            </svg>
            Schedule Interview
          </Button>
        </div>
      </div>
    </>
  );
}
