"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface NotificationsSectionProps {
  initialData?: {
    newApplications: boolean;
    aiAnalysisComplete: boolean;
    interviewReminders: boolean;
  };
}

export function NotificationsSection({ initialData }: NotificationsSectionProps) {
  const [newApplications, setNewApplications] = useState(initialData?.newApplications ?? true);
  const [aiAnalysisComplete, setAiAnalysisComplete] = useState(initialData?.aiAnalysisComplete ?? true);
  const [interviewReminders, setInterviewReminders] = useState(initialData?.interviewReminders ?? true);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
        <p className="text-sm text-neutral-500">Choose what updates you receive</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-neutral-900 dark:text-neutral-50">
              New applications
            </div>
            <div className="text-sm text-neutral-500">
              Notify when candidates apply to your jobs
            </div>
          </div>
          <Switch checked={newApplications} onCheckedChange={setNewApplications} />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-neutral-900 dark:text-neutral-50">
              AI analysis complete
            </div>
            <div className="text-sm text-neutral-500">
              Notify when AI screening is complete
            </div>
          </div>
          <Switch checked={aiAnalysisComplete} onCheckedChange={setAiAnalysisComplete} />
        </div>
        
        {/* <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-neutral-900 dark:text-neutral-50">
              Interview reminders
            </div>
            <div className="text-sm text-neutral-500">
              Get reminders before scheduled interviews
            </div>
          </div>
          <Switch checked={interviewReminders} onCheckedChange={setInterviewReminders} />
        </div> */}
      </CardContent>
    </Card>
  );
}
