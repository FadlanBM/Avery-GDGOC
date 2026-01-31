"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";

interface ProfileData {
  fullname: string;
  email: string;
  position: string;
  address?: string;
  gender?: boolean; // true = male, false = female
}

export function ProfileSection() {
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await axios.get("/api/auth-recruiter/me");
      if (response.data.status) {
        setProfileData({
          fullname: response.data.data.fullname,
          email: response.data.data.email,
          position: response.data.data.position,
          address: response.data.data.address,
          gender: response.data.data.gender,
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

  const handleEditProfile = () => {
    router.push("/settings/edit-profile");
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Profile</CardTitle>
          <p className="text-sm text-neutral-500">Update your personal information</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <Skeleton className="h-4 w-16 mb-1" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div>
              <Skeleton className="h-4 w-12 mb-1" />
              <Skeleton className="h-5 w-48" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-5 w-40" />
            </div>
          </div>
          <Skeleton className="h-10 w-24" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Profile</CardTitle>
          <p className="text-sm text-neutral-500">Update your personal information</p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">{error}</p>
          <Button
            onClick={fetchProfileData}
            variant="outline"
            className="mt-2"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Profile</CardTitle>
        <p className="text-sm text-neutral-500">Update your personal information</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <p className="text-sm text-neutral-500">Full Name</p>
            <p className="font-medium text-neutral-900 dark:text-neutral-50">
              {profileData?.fullname || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Email</p>
            <p className="font-medium text-neutral-900 dark:text-neutral-50">
              {profileData?.email || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Position</p>
            <p className="font-medium text-neutral-900 dark:text-neutral-50">
              {profileData?.position || "N/A"}
            </p>
          </div>
          {profileData?.gender !== undefined && (
            <div>
              <p className="text-sm text-neutral-500">Gender</p>
              <p className="font-medium text-neutral-900 dark:text-neutral-50">
                {profileData.gender ? "Male" : "Female"}
              </p>
            </div>
          )}
          {profileData?.address && (
            <div>
              <p className="text-sm text-neutral-500">Address</p>
              <p className="font-medium text-neutral-900 dark:text-neutral-50">
                {profileData.address}
              </p>
            </div>
          )}
        </div>
        <Button onClick={handleEditProfile} className="bg-[#265BFF] hover:bg-[#1E4ED8] w-1/4 text-xs">
          Edit Profile
        </Button>
      </CardContent>
    </Card>
  );
}
