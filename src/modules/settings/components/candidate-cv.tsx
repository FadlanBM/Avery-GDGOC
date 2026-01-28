"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import axiosSupabase from "@/lib/axios-supabase";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Upload, FileText, Trash2, Loader2, Star, Download, AlertCircle } from "lucide-react";

interface CV {
  id: string;
  asset_id: string;
  is_primary: boolean;
  created_at: string;
  file_name: string;
  file_url: string;
  file_size: number;
}

export function CandidateCV() {
  const [loading, setLoading] = useState(true);
  const [cvs, setCvs] = useState<CV[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [settingPrimary, setSettingPrimary] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCVs();
  }, []);

  const fetchCVs = async (showErrorToast = false) => {
    try {
      const response = await axiosSupabase.get("/api/candidate/cv");
      if (response.data.status) {
        setCvs(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching CVs:", error);
      if (showErrorToast) {
        toast.error("Failed to load CVs");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    // Validate file
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axiosSupabase.post("/api/candidate/cv", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.status) {
        toast.success("CV uploaded successfully!");
        fetchCVs(true);
      }
    } catch (error) {
      console.error("Error uploading CV:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to upload CV");
      } else {
        toast.error("An error occurred while uploading");
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSetPrimary = async (id: string) => {
    setSettingPrimary(id);
    try {
      await axiosSupabase.put(`/api/candidate/cv/${id}`, { is_primary: true });
      toast.success("Primary CV updated successfully!");
      fetchCVs(true);
    } catch (error) {
      console.error("Error setting primary CV:", error);
      toast.error("Failed to update primary CV");
    } finally {
      setSettingPrimary(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this CV?")) return;

    setDeleting(id);
    try {
      await axiosSupabase.delete(`/api/candidate/cv/${id}`);
      toast.success("CV deleted successfully!");
      fetchCVs(true);
    } catch (error) {
      console.error("Error deleting CV:", error);
      toast.error("Failed to delete CV");
    } finally {
      setDeleting(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold">CV Management</CardTitle>
          <p className="text-sm text-neutral-500">Upload and manage your CVs</p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-[#265BFF] hover:bg-[#1e4acc]"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload CV
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-medium mb-1">CV Upload Guidelines:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
                <li>Only PDF files are accepted</li>
                <li>Maximum file size: 5MB</li>
                <li>One primary CV will be used for job applications</li>
              </ul>
            </div>
          </div>
        </div>

        {cvs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-neutral-400" />
            <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              No CVs uploaded yet
            </h3>
            <p className="mt-2 text-sm text-neutral-500">
              Upload your CV to start applying for jobs
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="mt-4 bg-[#265BFF] hover:bg-[#1e4acc]"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload CV
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {cvs.filter(cv => cv.file_name).map((cv) => (
              <Card
                key={cv.id}
                className={`border-neutral-200 dark:border-neutral-700 ${
                  cv.is_primary ? "ring-2 ring-[#265BFF] bg-blue-50/50 dark:bg-blue-950/20" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                        <FileText className="h-6 w-6 text-neutral-600 dark:text-neutral-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 truncate">
                            {cv.file_name}
                          </h4>
                          {cv.is_primary && (
                            <Badge className="bg-[#265BFF] hover:bg-[#265BFF]">
                              <Star className="h-3 w-3 mr-1 fill-current" />
                              Primary
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-neutral-500">
                          <span>{formatFileSize(cv.file_size)}</span>
                          <span>•</span>
                          <span>Uploaded {formatDate(cv.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(cv.file_url, "_blank")}
                        title="Download CV"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {!cv.is_primary && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetPrimary(cv.id)}
                          disabled={settingPrimary === cv.id}
                          title="Set as primary"
                        >
                          {settingPrimary === cv.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Star className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(cv.id)}
                        disabled={deleting === cv.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete CV"
                      >
                        {deleting === cv.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
