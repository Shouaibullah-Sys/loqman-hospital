"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

export interface DatePickerProps {
  date?: Date | null;
  setDate: (date: Date | null) => void;
  onSelect?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  date,
  setDate,
  onSelect,
  placeholder = "انتخاب تاریخ",
  className,
  disabled = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate || null);
    setIsOpen(false);
    onSelect?.();
  };

  const formatDate = (date: Date | null) => {
    if (!date) return null;

    // Format date in Persian/Farsi
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start text-right font-normal",
          !date && "text-muted-foreground",
          className
        )}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <CalendarIcon className="ml-2 h-4 w-4" />
        {date ? formatDate(date) : placeholder}
      </Button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-auto rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none animate-in">
          <Calendar
            mode="single"
            selected={date || undefined}
            onSelect={handleSelect}
            initialFocus
          />
          <div className="flex justify-end mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              بستن
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
