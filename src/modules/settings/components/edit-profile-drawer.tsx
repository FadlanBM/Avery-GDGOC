"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function EditProfileDrawer() {
  const router = useRouter();
  
  // HRD Data
  const [fullName, setFullName] = useState("Maya Kim");
  const [email, setEmail] = useState("maya.kim@company.com");
  const [jobTitle, setJobTitle] = useState("Senior HR Recruiter");
  const [phone, setPhone] = useState("+1 (555) 123-4567");
  const [department, setDepartment] = useState("Human Resources");
  
  // Company Data
  const [companyName, setCompanyName] = useState("TechCorp Inc.");
  const [companyIndustry, setCompanyIndustry] = useState("Technology");
  const [companySize, setCompanySize] = useState("500-1000 employees");
  const [companyWebsite, setCompanyWebsite] = useState("https://techcorp.com");
  const [companyAddress, setCompanyAddress] = useState("123 Tech Street, San Francisco, CA 94102");
  const [companyDescription, setCompanyDescription] = useState("Leading technology company focused on innovation and digital transformation.");

  const handleSaveChanges = async () => {
    // Handle save changes logic
    console.log("Saving profile changes...");
    // After save, redirect back to settings
    router.push("/settings");
  };

  const handleCancel = () => {
    router.push("/settings");
  };

  return (
    <main className="flex-1 p-8 mt-16">
      <div className="max-w-4xl">
        {/* Header with back button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            className="mb-4 -ml-2 text-neutral-600 hover:text-neutral-900"
            onClick={handleCancel}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Button>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
            Edit Profile
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Update your personal and company information
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
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Maya Kim"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="maya.kim@company.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title *</Label>
                  <Input
                    id="jobTitle"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Senior HR Recruiter"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Human Resources"
                />
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Company Information</CardTitle>
              <p className="text-sm text-neutral-500">Details about your organization</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="TechCorp Inc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyIndustry">Industry *</Label>
                  <Input
                    id="companyIndustry"
                    value={companyIndustry}
                    onChange={(e) => setCompanyIndustry(e.target.value)}
                    placeholder="Technology"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size</Label>
                  <Input
                    id="companySize"
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    placeholder="500-1000 employees"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyWebsite">Website</Label>
                  <Input
                    id="companyWebsite"
                    type="url"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    placeholder="https://company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyAddress">Company Address</Label>
                <Input
                  id="companyAddress"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  placeholder="123 Street, City, State ZIP"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyDescription">Company Description</Label>
                <Textarea
                  id="companyDescription"
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  placeholder="Brief description of your company..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveChanges}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
