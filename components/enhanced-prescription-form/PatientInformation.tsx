// components/enhanced-prescription-form/PatientInformation.tsx
import React, { useState, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Phone,
  Calendar,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Activity,
} from "lucide-react";
import { Prescription } from "@/types/prescription";
import { calculateBMI, getBMICategory } from "@/utils/calculations";
import { cn } from "@/lib/utils";

interface PatientInformationProps {
  prescription: Prescription;
  onUpdateField: (field: keyof Prescription, value: any) => void;
}

export function PatientInformation({
  prescription,
  onUpdateField,
}: PatientInformationProps) {
  // Type definition for input field names
  type InputFieldName =
    | "patientName"
    | "patientAge"
    | "patientGender"
    | "patientPhone"
    | "weight"
    | "height";

  // Create refs for all input fields
  const inputRefs = useRef({
    patientName: useRef<HTMLInputElement>(null),
    patientAge: useRef<HTMLInputElement>(null),
    patientPhone: useRef<HTMLInputElement>(null),
    weight: useRef<HTMLInputElement>(null),
    height: useRef<HTMLInputElement>(null),
    patientGender: useRef<HTMLButtonElement>(null), // Select trigger ref
  });

  // Field order for navigation
  const fieldOrder: InputFieldName[] = [
    "patientName",
    "patientAge",
    "patientGender",
    "patientPhone",
    "weight",
    "height",
  ];

  // State for validation and interactions
  const [activeSection, setActiveSection] = useState<"personal" | "metrics">(
    "personal"
  );
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [lastCalculated, setLastCalculated] = useState<Date | null>(null);

  // Handle Enter key navigation with enhanced feedback
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, currentField: InputFieldName) => {
      if (event.key === "Enter") {
        event.preventDefault();

        // Validate current field before proceeding
        const currentValue = prescription[currentField];
        if (currentField === "patientName" && !currentValue?.trim()) {
          setValidationErrors((prev) => ({
            ...prev,
            patientName: "Patient name is required",
          }));
          return;
        }

        // Clear validation error for this field
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[currentField];
          return newErrors;
        });

        // Find current field index
        const currentIndex = fieldOrder.indexOf(currentField);
        if (currentIndex === -1) return;

        // Find next focusable field
        let nextIndex = currentIndex + 1;
        while (nextIndex < fieldOrder.length) {
          const nextField = fieldOrder[nextIndex];
          const nextRef = inputRefs.current[nextField];

          // Check if ref exists and is valid
          if (nextRef?.current) {
            // Add visual feedback for navigation
            const currentElement = event.currentTarget as HTMLElement;
            currentElement.classList.add(
              "ring-2",
              "ring-blue-500",
              "ring-offset-1"
            );
            setTimeout(() => {
              currentElement.classList.remove(
                "ring-2",
                "ring-blue-500",
                "ring-offset-1"
              );
            }, 300);

            // Special handling for Select trigger
            if (nextField === "patientGender") {
              setTimeout(() => {
                if (nextRef.current) {
                  (nextRef.current as HTMLButtonElement).focus();
                  setActiveSection("personal");
                }
              }, 50);
            } else {
              setTimeout(() => {
                if (nextRef.current) {
                  (nextRef.current as HTMLInputElement).focus();
                  if (nextField === "weight" || nextField === "height") {
                    setActiveSection("metrics");
                  }
                }
              }, 50);
            }
            return;
          }
          nextIndex++;
        }

        // If we reached the end, focus the first field
        const firstRef = inputRefs.current[fieldOrder[0]];
        if (firstRef?.current) {
          setTimeout(() => {
            if (firstRef.current) {
              (firstRef.current as HTMLInputElement).focus();
              setActiveSection("personal");
            }
          }, 50);
        }
      }
    },
    [prescription]
  );

  // Handle weight change and auto-calculate BMI
  const handleWeightChange = (value: string) => {
    // Validate weight
    const weightNum = parseFloat(value);
    if (weightNum && (weightNum < 2 || weightNum > 300)) {
      setValidationErrors((prev) => ({
        ...prev,
        weight: "Weight must be between 2kg and 300kg",
      }));
    } else {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.weight;
        return newErrors;
      });
    }

    onUpdateField("weight", value);
    if (prescription.height) {
      const bmi = calculateBMI(value, prescription.height);
      onUpdateField("bmi", bmi);
    }

    // Auto-focus to height only if weight looks complete
    const looksComplete = value.length >= 2 && /^\d+(\.\d*)?$/.test(value);

    if (looksComplete && inputRefs.current.height?.current) {
      setTimeout(() => {
        inputRefs.current.height.current?.focus();
        setActiveSection("metrics");
      }, 500);
    }
  };

  // Handle height change and auto-calculate BMI
  const handleHeightChange = (value: string) => {
    // Validate height
    const heightNum = parseFloat(value);
    if (heightNum && (heightNum < 50 || heightNum > 250)) {
      setValidationErrors((prev) => ({
        ...prev,
        height: "Height must be between 50cm and 250cm",
      }));
    } else {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.height;
        return newErrors;
      });
    }

    onUpdateField("height", value);
    if (prescription.weight) {
      const bmi = calculateBMI(prescription.weight, value);
      onUpdateField("bmi", bmi);
    }
  };

  // Get BMI category for display
  const bmiCategory = prescription.bmi
    ? getBMICategory(prescription.bmi)
    : null;

  // Check if all required fields are filled
  const isComplete =
    prescription.patientName &&
    prescription.patientAge &&
    prescription.patientGender &&
    prescription.weight &&
    prescription.height;

  return (
    <div
      id="patient-information"
      className="group flex flex-col sm:flex-row border-2 border-blue-100 rounded-xl overflow-hidden hover:border-blue-200 transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30 shadow-sm hover:shadow-md dark:border-blue-800/30 dark:hover:border-blue-700/50 dark:from-gray-900 dark:to-blue-950/10"
    >
      {/* Left Sidebar - Clinical Summary */}
      <div
        className={cn(
          "w-full sm:w-1/4 p-4 sm:p-5 border-b sm:border-b-0 sm:border-r border-blue-200/50 transition-all duration-300",
          "bg-gradient-to-b from-blue-50/80 to-white",
          activeSection === "personal" && "bg-blue-50/90",
          "dark:border-blue-800/30 dark:from-blue-950/40 dark:to-gray-900 dark:bg-blue-950/50"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-sm">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base tracking-tight text-gray-900 dark:text-white">
                Patient Profile
              </div>
              <div className="text-xs text-blue-600 font-medium mt-0.5 dark:text-blue-300">
                Clinical Data Summary
              </div>
            </div>
          </div>

          {/* Patient Status */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Status
              </span>
              {isComplete ? (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full dark:bg-green-900/30">
                  <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">
                    Complete
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 rounded-full dark:bg-amber-900/30">
                  <AlertCircle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                    In Progress
                  </span>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="space-y-3">
              {prescription.patientName && (
                <div className="p-2 bg-white rounded-lg border border-blue-100 dark:bg-gray-800/50 dark:border-blue-800/30">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Name
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {prescription.patientName}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                {prescription.patientAge && (
                  <div className="p-2 bg-white rounded-lg border border-blue-100 dark:bg-gray-800/50 dark:border-blue-800/30">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Age
                    </div>
                    <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {prescription.patientAge} yrs
                    </div>
                  </div>
                )}

                {prescription.patientGender && (
                  <div className="p-2 bg-white rounded-lg border border-blue-100 dark:bg-gray-800/50 dark:border-blue-800/30">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Sex
                    </div>
                    <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {prescription.patientGender}
                    </div>
                  </div>
                )}
              </div>

              {/* BMI Status Card */}
              {prescription.bmi && bmiCategory && (
                <div
                  className={cn(
                    "p-3 rounded-lg border transition-all duration-300",
                    bmiCategory.color.includes("green") &&
                      "bg-green-50/80 border-green-200 dark:bg-green-900/20 dark:border-green-800/30",
                    bmiCategory.color.includes("amber") &&
                      "bg-amber-50/80 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/30",
                    bmiCategory.color.includes("red") &&
                      "bg-red-50/80 border-red-200 dark:bg-red-900/20 dark:border-red-800/30"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        BMI Status
                      </div>
                      <div
                        className={cn(
                          "text-lg font-bold mt-1",
                          bmiCategory.color
                        )}
                      >
                        {prescription.bmi}
                      </div>
                    </div>
                    <Activity
                      className={cn(
                        "h-8 w-8",
                        bmiCategory.color.includes("green") &&
                          "text-green-400 dark:text-green-400",
                        bmiCategory.color.includes("amber") &&
                          "text-amber-400 dark:text-amber-400",
                        bmiCategory.color.includes("red") &&
                          "text-red-400 dark:text-red-400"
                      )}
                    />
                  </div>
                  <div
                    className={cn(
                      "text-xs font-medium mt-2 px-2 py-1 rounded-full inline-block",
                      bmiCategory.color.includes("text-") &&
                        bmiCategory.color.replace("text-", "bg-") + "/10",
                      bmiCategory.color
                    )}
                  >
                    {bmiCategory.category}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Guide */}
          <div className="mt-auto pt-4 border-t border-blue-100 dark:border-blue-800/30">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Navigation Guide
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
                <ChevronRight className="h-3 w-3 mr-1" />
                <span>
                  Press
                  <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono mx-1 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    Enter
                  </kbd>{" "}
                  to navigate
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                Auto-calculates BMI on input
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Data Entry */}
      <div
        className={cn(
          "w-full sm:w-3/4 p-4 sm:p-5 transition-all duration-300",
          activeSection === "metrics" &&
            "bg-gradient-to-br from-purple-50/20 to-white dark:from-purple-950/10 dark:to-gray-900"
        )}
      >
        <div className="space-y-5">
          {/* Section 1: Personal Information */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <div className="p-1.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                  <User className="h-4 w-4 text-white" />
                </div>
                Personal Information
                <div className="ml-2 text-xs font-normal px-2 py-1 bg-blue-100 text-blue-700 rounded-full dark:bg-blue-900/30 dark:text-blue-300">
                  Required Fields
                </div>
              </Label>
              {validationErrors.patientName && (
                <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="h-3 w-3" />
                  {validationErrors.patientName}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gradient-to-br from-white to-blue-50/50 rounded-xl border-2 border-blue-100 shadow-sm dark:from-gray-800/50 dark:to-blue-950/20 dark:border-blue-800/30">
              {/* Full Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="patientName"
                  className="text-xs font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-300"
                >
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                  Full Patient Name *
                </Label>
                <Input
                  id="patientName"
                  ref={inputRefs.current.patientName}
                  value={prescription.patientName || ""}
                  onChange={(e) => onUpdateField("patientName", e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, "patientName")}
                  onFocus={() => setActiveSection("personal")}
                  className="h-9 text-sm bg-white border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 placeholder:text-gray-500 dark:bg-gray-800 dark:border-blue-700 dark:text-gray-100 dark:placeholder:text-gray-400"
                  placeholder="Enter patient's full name"
                  required
                />
              </div>

              {/* Age */}
              <div className="space-y-2">
                <Label
                  htmlFor="patientAge"
                  className="text-xs font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-300"
                >
                  <Calendar className="h-3.5 w-3.5 text-blue-500" />
                  Age (years)
                </Label>
                <Input
                  id="patientAge"
                  ref={inputRefs.current.patientAge}
                  type="number"
                  min="0"
                  max="120"
                  value={prescription.patientAge || ""}
                  onChange={(e) => onUpdateField("patientAge", e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, "patientAge")}
                  onFocus={() => setActiveSection("personal")}
                  className="h-9 text-sm bg-white border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 placeholder:text-gray-500 dark:bg-gray-800 dark:border-blue-700 dark:text-gray-100 dark:placeholder:text-gray-400"
                  placeholder="e.g., 35"
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label
                  htmlFor="patientGender"
                  className="text-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Sex
                </Label>
                <Select
                  value={prescription.patientGender || ""}
                  onValueChange={(value) => {
                    onUpdateField("patientGender", value);
                    setActiveSection("personal");
                  }}
                >
                  <SelectTrigger
                    ref={inputRefs.current.patientGender}
                    id="patientGender"
                    onFocus={() => setActiveSection("personal")}
                    className="h-9 text-sm bg-white border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 dark:bg-gray-800 dark:border-blue-700 dark:text-gray-100"
                    onKeyDown={(e) =>
                      handleKeyDown(e as React.KeyboardEvent, "patientGender")
                    }
                  >
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-blue-200 dark:bg-gray-800 dark:border-blue-700">
                    <SelectItem
                      value="Male"
                      className="text-sm text-gray-900 hover:bg-blue-50 focus:bg-blue-50 dark:text-gray-200 dark:hover:bg-blue-900/30 dark:focus:bg-blue-900/30"
                    >
                      Male
                    </SelectItem>
                    <SelectItem
                      value="Female"
                      className="text-sm text-gray-900 hover:bg-blue-50 focus:bg-blue-50 dark:text-gray-200 dark:hover:bg-blue-900/30 dark:focus:bg-blue-900/30"
                    >
                      Female
                    </SelectItem>
                    <SelectItem
                      value="Other"
                      className="text-sm text-gray-900 hover:bg-blue-50 focus:bg-blue-50 dark:text-gray-200 dark:hover:bg-blue-900/30 dark:focus:bg-blue-900/30"
                    >
                      Other
                    </SelectItem>
                    <SelectItem
                      value="Prefer not to say"
                      className="text-sm text-gray-900 hover:bg-blue-50 focus:bg-blue-50 dark:text-gray-200 dark:hover:bg-blue-900/30 dark:focus:bg-blue-900/30"
                    >
                      Prefer not to say
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label
                  htmlFor="patientPhone"
                  className="text-xs font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-300"
                >
                  <Phone className="h-3.5 w-3.5 text-blue-500" />
                  Contact Number
                </Label>
                <Input
                  id="patientPhone"
                  ref={inputRefs.current.patientPhone}
                  type="tel"
                  value={prescription.patientPhone || ""}
                  onChange={(e) =>
                    onUpdateField("patientPhone", e.target.value)
                  }
                  onKeyDown={(e) => handleKeyDown(e, "patientPhone")}
                  onFocus={() => setActiveSection("personal")}
                  className="h-9 text-sm bg-white border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 placeholder:text-gray-500 dark:bg-gray-800 dark:border-blue-700 dark:text-gray-100 dark:placeholder:text-gray-400"
                  placeholder="09123456789"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
