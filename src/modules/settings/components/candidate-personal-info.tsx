"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Save } from "lucide-react";

interface PersonalInfo {
  fullname: string;
  gender: boolean;
  dateofbirth: string;
  address: string;
  phone: string;
}

export function CandidatePersonalInfo() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<PersonalInfo>({
    fullname: "",
    gender: false,
    dateofbirth: "",
    address: "",
    phone: "",
  });

  useEffect(() => {
    fetchPersonalInfo();
  }, []);

  const fetchPersonalInfo = async () => {
    try {
      const response = await axios.get("/api/auth-candidate/me");
      if (response.data.status && response.data.data) {
        const data = response.data.data;
        setFormData({
          fullname: data.name || "",
          gender: data.profile?.gender || false,
          dateofbirth: data.profile?.birth_date || "",
          address: data.profile?.address || "",
          phone: data.profile?.phone || "",
        });
      }
    } catch (error) {
      console.error("Error fetching personal info:", error);
      toast.error("Failed to load personal information");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await axios.put("/api/auth-candidate/me", formData);
      
      if (response.data.status) {
        toast.success("Personal information updated successfully!");
      }
    } catch (error) {
      console.error("Error updating personal info:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to update personal information");
      } else {
        toast.error("An error occurred while updating");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Personal Information</CardTitle>
        <p className="text-sm text-neutral-500">Update your personal details</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullname">Full Name</Label>
              <Input
                id="fullname"
                value={formData.fullname}
                onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                placeholder="Enter your full name"
                required
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter your phone number"
                required
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    checked={formData.gender === false}
                    onChange={() => setFormData({ ...formData, gender: false })}
                    disabled={saving}
                    className="w-4 h-4 text-[#265BFF] focus:ring-[#265BFF]"
                  />
                  <span className="text-sm">Female</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    checked={formData.gender === true}
                    onChange={() => setFormData({ ...formData, gender: true })}
                    disabled={saving}
                    className="w-4 h-4 text-[#265BFF] focus:ring-[#265BFF]"
                  />
                  <span className="text-sm">Male</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateofbirth">Date of Birth</Label>
              <Input
                id="dateofbirth"
                type="date"
                value={formData.dateofbirth}
                onChange={(e) => setFormData({ ...formData, dateofbirth: e.target.value })}
                required
                disabled={saving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter your address"
              rows={4}
              required
              disabled={saving}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#265BFF] hover:bg-[#1e4acc]"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
