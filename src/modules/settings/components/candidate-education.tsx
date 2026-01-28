"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import axiosSupabase from "@/lib/axios-supabase";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, GraduationCap, Calendar, Edit, Trash2, Loader2, School } from "lucide-react";

interface Education {
  id: string;
  level: string;
  institution_name: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  description: string;
}

interface EducationFormData {
  level: string;
  institution_name: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  description: string;
}

export function CandidateEducation() {
  const [loading, setLoading] = useState(true);
  const [educations, setEducations] = useState<Education[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [formData, setFormData] = useState<EducationFormData>({
    level: "",
    institution_name: "",
    field_of_study: "",
    start_date: "",
    end_date: "",
    description: "",
  });

  useEffect(() => {
    fetchEducations();
  }, []);

  const fetchEducations = async () => {
    try {
      const response = await axiosSupabase.get("/api/candidate/education");
      if (response.data.status) {
        setEducations(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching educations:", error);
      toast.error("Failed to load education records");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (education?: Education) => {
    if (education) {
      setEditingId(education.id);
      setFormData({
        level: education.level,
        institution_name: education.institution_name,
        field_of_study: education.field_of_study,
        start_date: education.start_date,
        end_date: education.end_date,
        description: education.description,
      });
    } else {
      setEditingId(null);
      setFormData({
        level: "",
        institution_name: "",
        field_of_study: "",
        start_date: "",
        end_date: "",
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
        await axiosSupabase.put(`/api/candidate/education/${editingId}`, formData);
        toast.success("Education updated successfully!");
      } else {
        await axiosSupabase.post("/api/candidate/education", formData);
        toast.success("Education added successfully!");
      }
      
      handleCloseDialog();
      fetchEducations();
    } catch (error) {
      console.error("Error saving education:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to save education");
      } else {
        toast.error("An error occurred");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this education record?")) return;
    
    setDeleting(id);
    try {
      await axiosSupabase.delete(`/api/candidate/education/${id}`);
      toast.success("Education deleted successfully!");
      fetchEducations();
    } catch (error) {
      console.error("Error deleting education:", error);
      toast.error("Failed to delete education");
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
            <CardTitle className="text-lg font-semibold">Education</CardTitle>
            <p className="text-sm text-neutral-500">Manage your educational background</p>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-[#265BFF] hover:bg-[#1e4acc]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Education
          </Button>
        </CardHeader>
        <CardContent>
          {educations.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="mx-auto h-12 w-12 text-neutral-400" />
              <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                No education records yet
              </h3>
              <p className="mt-2 text-sm text-neutral-500">
                Add your educational background to complete your profile
              </p>
              <Button
                onClick={() => handleOpenDialog()}
                className="mt-4 bg-[#265BFF] hover:bg-[#1e4acc]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Education
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {educations.map((edu) => (
                <div key={edu.id} className="py-5 first:pt-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4 flex-1">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-50 mb-1">
                          {edu.institution_name}
                        </h3>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-1">
                          {edu.field_of_study} · <span className="capitalize">{edu.level}</span>
                        </p>
                        <p className="text-sm text-neutral-500 mb-2">
                          {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                        </p>
                        {edu.description && (
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-line">
                            {edu.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(edu)}
                        disabled={deleting === edu.id}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(edu.id)}
                        disabled={deleting === edu.id}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {deleting === edu.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Education" : "Add Education"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="institution_name">Institution Name</Label>
                <Input
                  id="institution_name"
                  value={formData.institution_name}
                  onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                  placeholder="e.g., Stanford University"
                  required
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="field_of_study">Field of Study</Label>
                <Input
                  id="field_of_study"
                  value={formData.field_of_study}
                  onChange={(e) => setFormData({ ...formData, field_of_study: e.target.value })}
                  placeholder="e.g., Computer Science"
                  required
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Education Level</Label>
                <Input
                  id="level"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  placeholder="e.g., Bachelor's Degree"
                  required
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                {/* Empty space for grid alignment */}
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
                placeholder="Describe your achievements, courses, or any relevant details"
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
