// components/enhanced-prescription-form/VitalSigns.tsx
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Heart, Thermometer, Calculator } from "lucide-react";
import { Prescription } from "@/types/prescription";
import {
  calculateBMI,
  getBMICategory,
  calculateIdealBodyWeight,
  calculateBMR,
} from "@/utils/calculations";

interface VitalSignsProps {
  prescription: Prescription;
  onUpdateField: (field: keyof Prescription, value: any) => void;
}

export function VitalSigns({ prescription, onUpdateField }: VitalSignsProps) {
  // Handle weight change and auto-calculate BMI
  const handleWeightChange = (value: string) => {
    onUpdateField("weight", value);
    if (prescription.height) {
      const bmi = calculateBMI(value, prescription.height);
      onUpdateField("bmi", bmi);
    }
  };

  // Handle height change and auto-calculate BMI
  const handleHeightChange = (value: string) => {
    onUpdateField("height", value);
    if (prescription.weight) {
      const bmi = calculateBMI(prescription.weight, value);
      onUpdateField("bmi", bmi);
    }
  };

  // Calculate all metrics
  const calculateAllMetrics = () => {
    if (prescription.weight && prescription.height) {
      const bmi = calculateBMI(prescription.weight, prescription.height);
      onUpdateField("bmi", bmi);
    }
  };

  // Get BMI category for display
  const bmiCategory = prescription.bmi
    ? getBMICategory(prescription.bmi)
    : null;

  // Calculate other metrics
  const idealWeight =
    prescription.height && prescription.patientGender
      ? calculateIdealBodyWeight(
          prescription.height,
          prescription.patientGender
        )
      : "";
  const bmr =
    prescription.weight &&
    prescription.height &&
    prescription.patientAge &&
    prescription.patientGender
      ? calculateBMR(
          prescription.weight,
          prescription.height,
          prescription.patientAge,
          prescription.patientGender
        )
      : "";

  return (
    <div className="flex flex-col sm:flex-row border-b dark:border-border/30 hover:bg-muted/20 transition-colors">
      <div className="w-full sm:w-1/4 p-3 sm:p-4 border-b sm:border-b-0 sm:border-r dark:border-border/30 bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/20 dark:to-gray-900">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-300" />
          </div>
          <div>
            <div className="font-semibold text-sm sm:text-base">
              Vital Signs & Metrics
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Real-time calculations
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {prescription.bmi && bmiCategory && (
          <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded-md border border-purple-100 dark:border-purple-800">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
              Current Status
            </div>
            <div className={`text-sm font-bold ${bmiCategory.color} mt-1`}>
              {bmiCategory.category}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {bmiCategory.description}
            </div>
          </div>
        )}

        {/* Calculate Button */}
        <button
          onClick={calculateAllMetrics}
          className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 text-purple-700 dark:text-purple-300 rounded-md transition-colors"
        >
          <Calculator className="h-3 w-3" />
          Calculate All Metrics
        </button>
      </div>

      <div className="w-full sm:w-3/4 p-3 sm:p-4">
        <div className="space-y-4">
          {/* Body Metrics Section */}
          <div className="space-y-3">
            <Label className="text-xs sm:text-sm font-medium flex items-center gap-2 mb-2">
              <Calculator className="h-3.5 w-3.5" />
              Body Metrics & Calculations
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-blue-100 dark:border-gray-700">
              {/* Weight */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="weight"
                  className="text-xs font-medium flex items-center gap-1"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  Weight (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  min="0"
                  step="0.1"
                  value={prescription.weight || ""}
                  onChange={(e) => handleWeightChange(e.target.value)}
                  className="text-xs h-8 bg-white dark:bg-gray-800"
                  placeholder="e.g., 70.5"
                />
              </div>

              {/* Height */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="height"
                  className="text-xs font-medium flex items-center gap-1"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Height (cm)
                </Label>
                <Input
                  id="height"
                  type="number"
                  min="0"
                  step="0.1"
                  value={prescription.height || ""}
                  onChange={(e) => handleHeightChange(e.target.value)}
                  className="text-xs h-8 bg-white dark:bg-gray-800"
                  placeholder="e.g., 175.0"
                />
              </div>

              {/* BMI with Category */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="bmi"
                  className="text-xs font-medium flex items-center gap-1"
                >
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  BMI
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="bmi"
                    value={prescription.bmi || ""}
                    readOnly
                    className="text-xs h-8 bg-gray-100 dark:bg-gray-800 font-mono flex-1"
                    placeholder="Auto-calculated"
                  />
                  {prescription.bmi && (
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${
                        bmiCategory?.color
                      } bg-opacity-10 ${bmiCategory?.color.replace(
                        "text",
                        "bg"
                      )}`}
                    >
                      {bmiCategory?.category}
                    </span>
                  )}
                </div>
              </div>

              {/* Temperature */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="temperature"
                  className="text-xs font-medium flex items-center gap-1"
                >
                  <Thermometer className="h-3 w-3" />
                  Temperature (°C)
                </Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  value={prescription.temperature || ""}
                  onChange={(e) => onUpdateField("temperature", e.target.value)}
                  className="text-xs h-8 bg-white dark:bg-gray-800"
                  placeholder="36.8"
                />
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          {(idealWeight || bmr) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {idealWeight && (
                <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border border-green-100 dark:border-green-800">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Ideal Body Weight
                  </div>
                  <div className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">
                    {idealWeight} kg
                  </div>
                </div>
              )}

              {bmr && (
                <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg border border-blue-100 dark:border-blue-800">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Basal Metabolic Rate
                  </div>
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {bmr} kcal/day
                  </div>
                </div>
              )}

              {prescription.bmi && (
                <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg border border-purple-100 dark:border-purple-800">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Body Mass Index
                  </div>
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-1">
                    {prescription.bmi} kg/m²
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Vital Signs Grid */}
          <div className="space-y-3">
            <Label className="text-xs sm:text-sm font-medium flex items-center gap-2 mb-2">
              <Heart className="h-3.5 w-3.5 text-rose-500" />
              Vital Signs
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-rose-100 dark:border-gray-700">
              {/* Pulse Rate */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="pulseRate"
                  className="text-xs font-medium flex items-center gap-1"
                >
                  <Heart className="h-3 w-3 text-rose-500" />
                  Pulse Rate (bpm)
                </Label>
                <Input
                  id="pulseRate"
                  type="number"
                  min="0"
                  value={prescription.pulseRate || ""}
                  onChange={(e) => onUpdateField("pulseRate", e.target.value)}
                  className="text-xs h-8 bg-white dark:bg-gray-800"
                  placeholder="72"
                />
              </div>

              {/* Heart Rate */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="heartRate"
                  className="text-xs font-medium flex items-center gap-1"
                >
                  <Heart className="h-3 w-3 text-red-500" />
                  Heart Rate (bpm)
                </Label>
                <Input
                  id="heartRate"
                  type="number"
                  min="0"
                  value={prescription.heartRate || ""}
                  onChange={(e) => onUpdateField("heartRate", e.target.value)}
                  className="text-xs h-8 bg-white dark:bg-gray-800"
                  placeholder="72"
                />
              </div>

              {/* Respiratory Rate */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="respiratoryRate"
                  className="text-xs font-medium flex items-center gap-1"
                >
                  <Activity className="h-3 w-3 text-blue-500" />
                  Respiratory Rate (/min)
                </Label>
                <Input
                  id="respiratoryRate"
                  type="number"
                  min="0"
                  value={prescription.respiratoryRate || ""}
                  onChange={(e) =>
                    onUpdateField("respiratoryRate", e.target.value)
                  }
                  className="text-xs h-8 bg-white dark:bg-gray-800"
                  placeholder="16"
                />
              </div>

              {/* Blood Pressure */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="bloodPressure"
                  className="text-xs font-medium flex items-center gap-1"
                >
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  Blood Pressure
                </Label>
                <Input
                  id="bloodPressure"
                  value={prescription.bloodPressure || ""}
                  onChange={(e) =>
                    onUpdateField("bloodPressure", e.target.value)
                  }
                  className="text-xs h-8 bg-white dark:bg-gray-800"
                  placeholder="120/80"
                />
              </div>

              {/* Oxygen Saturation */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="oxygenSaturation"
                  className="text-xs font-medium flex items-center gap-1"
                >
                  <Activity className="h-3 w-3 text-blue-500" />
                  SpO₂ (%)
                </Label>
                <Input
                  id="oxygenSaturation"
                  type="number"
                  min="0"
                  max="100"
                  value={prescription.oxygenSaturation || ""}
                  onChange={(e) =>
                    onUpdateField("oxygenSaturation", e.target.value)
                  }
                  className="text-xs h-8 bg-white dark:bg-gray-800"
                  placeholder="98"
                />
              </div>

              {/* Empty slots for layout */}
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
