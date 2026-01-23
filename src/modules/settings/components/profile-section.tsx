"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProfileSectionProps {
  initialData?: {
    fullName: string;
    email: string;
    jobTitle: string;
  };
}

export function ProfileSection({ initialData }: ProfileSectionProps) {
  const router = useRouter();

  const handleEditProfile = () => {
    router.push("/settings/edit-profile");
  };

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
              {initialData?.fullName || "Maya Kim"}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Email</p>
            <p className="font-medium text-neutral-900 dark:text-neutral-50">
              {initialData?.email || "maya.kim@company.com"}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Job Title</p>
            <p className="font-medium text-neutral-900 dark:text-neutral-50">
              {initialData?.jobTitle || "Senior HR Recruiter"}
            </p>
          </div>
        </div>
        <Button onClick={handleEditProfile} className="bg-blue-600 hover:bg-blue-700 w-1/4">
          Edit Profile
        </Button>
      </CardContent>
    </Card>
  );
}
