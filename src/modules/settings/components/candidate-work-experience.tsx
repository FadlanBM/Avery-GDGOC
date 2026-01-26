"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Briefcase, Calendar, Edit, Trash2, Loader2, Building2 } from "lucide-react";

interface WorkExperience {
  id: string;
  work_type: string;
  work_name: string;
  company_name: string;
  start_date: string;
  end_date: string;
  internship: boolean;
  description: string;
}

interface WorkExperienceFormData {
  work_type: string;
  work_name: string;
  company_name: string;
  start_date: string;
  end_date: string;
  internship: boolean;
  description: string;
}

export function CandidateWorkExperience() {
  const [loading, setLoading] = useState(true);
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [formData, setFormData] = useState<WorkExperienceFormData>({
    work_type: "",
    work_name: "",
    company_name: "",
    start_date: "",
    end_date: "",
    internship: false,
    description: "",
  });

  useEffect(() => {
    fetchWorkExperiences();
  }, []);

  const fetchWorkExperiences = async () => {
    try {
      const response = await axios.get("/api/candidate/work-experience");
      if (response.data.status) {
        setExperiences(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching work experiences:", error);
      toast.error("Failed to load work experiences");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (experience?: WorkExperience) => {
    if (experience) {
      setEditingId(experience.id);
      setFormData({
        work_type: experience.work_type,
        work_name: experience.work_name,
        company_name: experience.company_name,
        start_date: experience.start_date,
        end_date: experience.end_date,
        internship: experience.internship,
        description: experience.description,
      });
    } else {
      setEditingId(null);
      setFormData({
        work_type: "",
        work_name: "",
        company_name: "",
        start_date: "",
        end_date: "",
        internship: false,
        description: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        await axios.put(`/api/candidate/work-experience/${editingId}`, formData);
        toast.success("Work experience updated successfully!");
      } else {
        await axios.post("/api/candidate/work-experience", formData);
        toast.success("Work experience added successfully!");
      }
      
      handleCloseDialog();
      fetchWorkExperiences();
    } catch (error) {
      console.error("Error saving work experience:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to save work experience");
      } else {
        toast.error("An error occurred");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this work experience?")) return;
    
    setDeleting(id);
    try {
      await axios.delete(`/api/candidate/work-experience/${id}`);
      toast.success("Work experience deleted successfully!");
      fetchWorkExperiences();
    } catch (error) {
      console.error("Error deleting work experience:", error);
      toast.error("Failed to delete work experience");
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-lg font-semibold">Work Experience</CardTitle>
            <p className="text-sm text-neutral-500">Manage your work history</p>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-[#265BFF] hover:bg-[#1e4acc]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Experience
          </Button>
        </CardHeader>
        <CardContent>
          {experiences.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="mx-auto h-12 w-12 text-neutral-400" />
              <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                No work experience yet
              </h3>
              <p className="mt-2 text-sm text-neutral-500">
                Add your first work experience to showcase your professional background
              </p>
              <Button
                onClick={() => handleOpenDialog()}
                className="mt-4 bg-[#265BFF] hover:bg-[#1e4acc]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Experience
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {experiences.map((exp) => (
                <Card key={exp.id} className="border-neutral-200 dark:border-neutral-700">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                            {exp.work_name}
                          </h3>
                          {exp.internship && (
                            <Badge variant="secondary" className="text-xs">
                              Internship
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                          <Building2 className="h-4 w-4" />
                          <span>{exp.company_name}</span>
                          <span>•</span>
                          <span className="capitalize">{exp.work_type}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-neutral-500 mb-3">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(exp.start_date)} - {formatDate(exp.end_date)}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-line">
                          {exp.description}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(exp)}
                          disabled={deleting === exp.id}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(exp.id)}
                          disabled={deleting === exp.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {deleting === exp.id ? (
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Work Experience" : "Add Work Experience"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="work_name">Job Title</Label>
                <Input
                  id="work_name"
                  value={formData.work_name}
                  onChange={(e) => setFormData({ ...formData, work_name: e.target.value })}
                  placeholder="e.g., Software Engineer"
                  required
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="e.g., Tech Corp"
                  required
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="work_type">Work Type</Label>
                <Input
                  id="work_type"
                  value={formData.work_type}
                  onChange={(e) => setFormData({ ...formData, work_type: e.target.value })}
                  placeholder="e.g., Full-time, Part-time"
                  required
                  disabled={saving}
                />
              </div>

              <div className="space-y-2 flex items-center">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="internship"
                    checked={formData.internship}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, internship: checked as boolean })
                    }
                    disabled={saving}
                  />
                  <Label htmlFor="internship" className="cursor-pointer">
                    This was an internship
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                  disabled={saving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your responsibilities and achievements"
                rows={5}
                required
                disabled={saving}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={saving}
              >
                Cancel
              </Button>
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
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
