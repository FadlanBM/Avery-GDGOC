"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateRangePreset } from "../types";
import { Calendar } from "lucide-react";
import { useState } from "react";

interface DateRangeSelectorProps {
  selectedPreset: DateRangePreset;
  customStartDate: string;
  customEndDate: string;
  onPresetChange: (preset: DateRangePreset) => void;
  onCustomDateChange: (startDate: string, endDate: string) => void;
  onApply: () => void;
}

export function DateRangeSelector({
  selectedPreset,
  customStartDate,
  customEndDate,
  onPresetChange,
  onCustomDateChange,
  onApply,
}: DateRangeSelectorProps) {
  const [showCustom, setShowCustom] = useState(selectedPreset === "custom");

  const handlePresetChange = (value: DateRangePreset) => {
    onPresetChange(value);
    setShowCustom(value === "custom");
    
    if (value !== "custom") {
      // Auto-apply for presets
      setTimeout(() => onApply(), 100);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-end">
      <div className="flex w-64">
        <Label htmlFor="date-range-preset" className="mb-2 block">Date Range</Label>
        <Select value={selectedPreset} onValueChange={handlePresetChange}>
          <SelectTrigger id="date-range-preset" className="w-full">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Select date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
            <SelectItem value="thisMonth">This Month</SelectItem>
            <SelectItem value="lastMonth">Last Month</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {showCustom && (
        <>
          <div className="flex-1">
            <Label htmlFor="start-date" className="mb-2 block">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={customStartDate}
              onChange={(e) => onCustomDateChange(e.target.value, customEndDate)}
              max={customEndDate || new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="flex-1">
            <Label htmlFor="end-date" className="mb-2 block">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={customEndDate}
              onChange={(e) => onCustomDateChange(customStartDate, e.target.value)}
              min={customStartDate}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          <Button onClick={onApply} className="whitespace-nowrap">
            Apply
          </Button>
        </>
      )}
    </div>
  );
}
