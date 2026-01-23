"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface AIPreferencesSectionProps {
  initialData?: {
    autoScreen: boolean;
    skillsMatching: boolean;
    experienceWeighting: boolean;
    biasDetection: boolean;
  };
}

export function AIPreferencesSection({ initialData }: AIPreferencesSectionProps) {
  const [autoScreen, setAutoScreen] = useState(initialData?.autoScreen ?? true);
  const [skillsMatching, setSkillsMatching] = useState(initialData?.skillsMatching ?? true);
  const [experienceWeighting, setExperienceWeighting] = useState(initialData?.experienceWeighting ?? true);
  const [biasDetection, setBiasDetection] = useState(initialData?.biasDetection ?? true);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">AI Screening Preferences</CardTitle>
        <p className="text-sm text-neutral-500">Configure how AI analyzes candidates</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-neutral-900 dark:text-neutral-50">
              Auto-screen new applications
            </div>
            <div className="text-sm text-neutral-500">
              Automatically analyze candidates when they apply
            </div>
          </div>
          <Switch checked={autoScreen} onCheckedChange={setAutoScreen} />
        </div>
        
        {/* <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-neutral-900 dark:text-neutral-50">
              Skills matching
            </div>
            <div className="text-sm text-neutral-500">
              Compare candidate skills against job requirements
            </div>
          </div>
          <Switch checked={skillsMatching} onCheckedChange={setSkillsMatching} />
        </div> */}
        
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-neutral-900 dark:text-neutral-50">
              Experience weighting
            </div>
            <div className="text-sm text-neutral-500">
              Prioritize years of relevant experience
            </div>
          </div>
          <Switch checked={experienceWeighting} onCheckedChange={setExperienceWeighting} />
        </div>
        
        {/* <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-neutral-900 dark:text-neutral-50">
              Bias detection alerts
            </div>
            <div className="text-sm text-neutral-500">
              Get notified about potential screening biases
            </div>
          </div>
          <Switch checked={biasDetection} onCheckedChange={setBiasDetection} />
        </div> */}
      </CardContent>
    </Card>
  );
}
