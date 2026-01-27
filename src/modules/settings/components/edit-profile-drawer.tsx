"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface ProfileData {
  fullname: string;
  email: string;
  position: string;
  gender?: string; // "male" | "female" | "" for form display
  dateofbirth?: string;
  address?: string;
}

export function EditProfileDrawer() {
  const router = useRouter();
  
  // Form data state
  const [formData, setFormData] = useState<ProfileData>({
    fullname: "",
    email: "",
    position: "",
    gender: "",
    dateofbirth: "",
    address: "",
  });
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await axios.get("/api/auth-recruiter/me");
      if (response.data.status) {
        const data = response.data.data;
        setFormData({
          fullname: data.fullname || "",
          email: data.email || "",
          position: data.position || "",
          gender: data.gender === true ? "male" : data.gender === false ? "female" : "",
          dateofbirth: data.dateofbirth || "",
          address: data.address || "",
        });
      } else {
        setError("Gagal mengambil data profil");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Gagal mengambil data profil");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    if (!formData.fullname.trim() || !formData.position.trim()) {
      toast.error("Nama lengkap dan posisi wajib diisi");
      return;
    }

    setSaving(true);
    try {
      // Convert gender string to boolean for API
      const apiData = {
        ...formData,
        gender: formData.gender === "male" ? true : formData.gender === "female" ? false : undefined,
      };
      
      const response = await axios.put("/api/auth-recruiter/me", apiData);
      if (response.data.status) {
        toast.success("Profil berhasil diupdate");
        
        // Refresh auth session to get updated user metadata
        const supabase = createClient();
        await supabase.auth.refreshSession();
        
        router.push("/settings");
        router.refresh(); // Refresh to update header
      } else {
        toast.error(response.data.message || "Gagal mengupdate profil");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      const errorMessage = err instanceof Error ? err.message : "Gagal mengupdate profil";
      const responseMessage = (err as any)?.response?.data?.message;
      toast.error(responseMessage || errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/settings");
  };

  if (loading) {
    return (
      <main className="flex-1 p-8 mt-16">
        <div className="max-w-4xl">
          <div className="mb-6">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 p-8 mt-16">
        <div className="max-w-4xl">
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchProfileData} variant="outline">
              Retry
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8 mt-16">
      <div className="max-w-4xl">
        {/* Header with back button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            className="mb-4 -ml-2 text-neutral-600 hover:text-neutral-900"
            onClick={handleCancel}
            disabled={saving}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Button>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
            Edit Profile
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Update your personal information
          </p>
        </div>

        <div className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Personal Information</CardTitle>
              <p className="text-sm text-neutral-500">Your HRD profile details</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullname">Full Name *</Label>
                  <Input
                    id="fullname"
                    value={formData.fullname}
                    onChange={(e) => handleInputChange('fullname', e.target.value)}
                    placeholder="Enter your full name"
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    placeholder="your.email@company.com"
                    className="bg-neutral-50 dark:bg-neutral-800"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    placeholder="Your job position"
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={saving}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateofbirth">Date of Birth</Label>
                  <Input
                    id="dateofbirth"
                    type="date"
                    value={formData.dateofbirth}
                    onChange={(e) => handleInputChange('dateofbirth', e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2"></div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Your address"
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveChanges}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={saving}
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

