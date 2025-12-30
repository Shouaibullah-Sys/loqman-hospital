import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BrainCircuit,
  Brain,
  HeartPulse,
  Radiation,
  Syringe,
  Eye,
  Ear,
  UserCheck,
  Activity,
  Stethoscope,
  Thermometer,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Prescription } from "@/types/prescription";
import { SYSTEM_EXAM_OPTIONS } from "./constants";

interface SystemExaminationsProps {
  prescription: Prescription;
  onUpdateField: (field: keyof Prescription, value: any) => void;
  selectedQuickOptions: Record<string, string[]>;
  onToggleQuickOption: (
    system: keyof typeof SYSTEM_EXAM_OPTIONS,
    option: string
  ) => void;
}

export function SystemExaminations({
  prescription,
  onUpdateField,
  selectedQuickOptions,
  onToggleQuickOption,
}: SystemExaminationsProps) {
  // Count quick options selected per system
  const quickOptionsCount = {
    cns: selectedQuickOptions.cns?.length || 0,
    cardiovascular: selectedQuickOptions.cardiovascular?.length || 0,
    respiratory: selectedQuickOptions.respiratory?.length || 0,
    gastrointestinal: selectedQuickOptions.gastrointestinal?.length || 0,
  };

  return (
    <div className="flex flex-col sm:flex-row border-b dark:border-border/30 hover:bg-muted/20 transition-colors">
      {/* Left Sidebar */}
      <div className="w-full sm:w-1/4 p-3 sm:p-4 border-b sm:border-b-0 sm:border-r dark:border-border/30 bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/20 dark:to-gray-900">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 sm:p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
            <BrainCircuit className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-300" />
          </div>
          <div>
            <div className="font-semibold text-sm sm:text-base">
              System Examinations
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Physical & Clinical Findings
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-3 space-y-2">
          {/* Quick Options Summary */}
          <div className="p-2 bg-white dark:bg-gray-800 rounded-md border border-emerald-100 dark:border-emerald-800">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <UserCheck className="h-3 w-3" />
              Quick Options Selected
            </div>
            <div className="mt-1 space-y-1">
              {Object.entries(quickOptionsCount).map(([system, count]) => (
                <div
                  key={system}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-gray-500 capitalize">{system}:</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Examination Status */}
          <div className="p-2 bg-white dark:bg-gray-800 rounded-md border border-blue-100 dark:border-blue-800">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-blue-500" />
              Examination Status
            </div>
            <div className="mt-1 text-sm font-medium">
              {Object.values(quickOptionsCount).some((count) => count > 0)
                ? "Partially Complete"
                : "Not Started"}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full sm:w-3/4 p-3 sm:p-4">
        <div className="space-y-4">
          {/* Quick Notes Section */}
          <div className="mb-2">
            <Label className="text-xs sm:text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
              Quick Selection Options
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5 pl-1">
              Click buttons to quickly add common findings to text areas below
            </p>
          </div>

          {/* Use Accordion for collapsible sections */}
          <Accordion type="multiple" className="w-full space-y-3">
            {/* CNS & Neurological Examination */}
            <AccordionItem
              value="cns"
              className="border border-purple-100 dark:border-purple-800 rounded-lg px-3 sm:px-4 bg-gradient-to-b from-purple-50 to-white dark:from-gray-800 dark:to-gray-900"
            >
              <AccordionTrigger className="py-3 hover:no-underline group">
                <div className="flex items-center gap-2 w-full">
                  <div className="p-1.5 bg-purple-100 dark:bg-purple-900 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                    <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-300" />
                  </div>
                  <div className="text-left flex-1">
                    <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                      Inspection{" "}
                    </span>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Consciousness, motor, sensory, and reflexes
                    </div>
                  </div>
                  <div className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                    {quickOptionsCount.cns} selected
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 space-y-3">
                <div className="mb-2">
                  <Label className="text-xs font-medium flex items-center gap-1 mb-1">
                    <Activity className="h-3 w-3" />
                    Quick Options
                  </Label>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {SYSTEM_EXAM_OPTIONS.cns.slice(0, 10).map((option, idx) => (
                      <Button
                        key={idx}
                        type="button"
                        variant={
                          selectedQuickOptions.cns?.includes(option.label)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => onToggleQuickOption("cns", option.label)}
                        className="text-xs h-6 sm:h-7 px-2 flex items-center gap-1 transition-all duration-200"
                      >
                        <span>{option.icon}</span>
                        <span className="truncate max-w-[100px] sm:max-w-[140px]">
                          {option.label}
                        </span>
                        {selectedQuickOptions.cns?.includes(option.label) && (
                          <CheckCircle2 className="h-2.5 w-2.5" />
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium flex items-center gap-1 mb-1">
                    <Brain className="h-3 w-3" />
                    Detailed Findings
                  </Label>
                  <Textarea
                    value={prescription.cnsExamination || ""}
                    onChange={(e) =>
                      onUpdateField("cnsExamination", e.target.value)
                    }
                    className="text-xs sm:text-sm min-h-[120px] bg-gradient-to-b from-purple-50 to-white dark:from-gray-800 dark:to-gray-900 border-purple-100 dark:border-purple-800 font-mono"
                    placeholder="• Consciousness: Alert and oriented (GCS 15/15)
• Cranial nerves: Intact I-XII
• Motor: Normal tone and power 5/5 all limbs
• Sensory: Intact to light touch, pain, vibration, proprioception
• Reflexes: Brisk, symmetrical (2+)
• Coordination: Normal finger-nose, heel-shin
• Gait: Steady, no ataxia
• Romberg: Negative
• Higher functions: Normal memory, attention, language"
                    rows={4}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Cardiovascular System Examination */}
            <AccordionItem
              value="cardiovascular"
              className="border border-red-100 dark:border-red-800 rounded-lg px-3 sm:px-4 bg-gradient-to-b from-red-50 to-white dark:from-gray-800 dark:to-gray-900"
            >
              <AccordionTrigger className="py-3 hover:no-underline group">
                <div className="flex items-center gap-2 w-full">
                  <div className="p-1.5 bg-red-100 dark:bg-red-900 rounded-lg group-hover:bg-red-200 dark:group-hover:bg-red-800 transition-colors">
                    <HeartPulse className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-300" />
                  </div>
                  <div className="text-left flex-1">
                    <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                      Palpation{" "}
                    </span>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Heart sounds, pulses, and circulation
                    </div>
                  </div>
                  <div className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">
                    {quickOptionsCount.cardiovascular} selected
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 space-y-3">
                <div className="mb-2">
                  <Label className="text-xs font-medium flex items-center gap-1 mb-1">
                    <Activity className="h-3 w-3" />
                    Quick Options
                  </Label>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {SYSTEM_EXAM_OPTIONS.cardiovascular
                      .slice(0, 10)
                      .map((option, idx) => (
                        <Button
                          key={idx}
                          type="button"
                          variant={
                            selectedQuickOptions.cardiovascular?.includes(
                              option.label
                            )
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            onToggleQuickOption("cardiovascular", option.label)
                          }
                          className="text-xs h-6 sm:h-7 px-2 flex items-center gap-1 transition-all duration-200"
                        >
                          <span>{option.icon}</span>
                          <span className="truncate max-w-[100px] sm:max-w-[140px]">
                            {option.label}
                          </span>
                          {selectedQuickOptions.cardiovascular?.includes(
                            option.label
                          ) && <CheckCircle2 className="h-2.5 w-2.5" />}
                        </Button>
                      ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium flex items-center gap-1 mb-1">
                    <HeartPulse className="h-3 w-3" />
                    Detailed Findings
                  </Label>
                  <Textarea
                    value={prescription.cardiovascularExamination || ""}
                    onChange={(e) =>
                      onUpdateField("cardiovascularExamination", e.target.value)
                    }
                    className="text-xs sm:text-sm min-h-[120px] bg-gradient-to-b from-red-50 to-white dark:from-gray-800 dark:to-gray-900 border-red-100 dark:border-red-800 font-mono"
                    placeholder="• Heart sounds: S1, S2 normal, no murmurs, rubs, or gallops
• Pulse: Regular rhythm, rate 72 bpm, all peripheral pulses palpable
• JVP: 3 cm H2O at 45 degrees
• Blood pressure: 120/80 mmHg (both arms)
• Precordium: No heaves, thrills, or scars
• No peripheral edema or cyanosis
• Capillary refill: <2 seconds
• Carotid bruits: None
• Varicose veins: None"
                    rows={4}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Respiratory System Examination */}
            <AccordionItem
              value="respiratory"
              className="border border-blue-100 dark:border-blue-800 rounded-lg px-3 sm:px-4 bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-900"
            >
              <AccordionTrigger className="py-3 hover:no-underline group">
                <div className="flex items-center gap-2 w-full">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                    <Radiation className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div className="text-left flex-1">
                    <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                      Percussion
                    </span>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Breathing patterns, sounds, and oxygen status
                    </div>
                  </div>
                  <div className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                    {quickOptionsCount.respiratory} selected
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 space-y-3">
                <div className="mb-2">
                  <Label className="text-xs font-medium flex items-center gap-1 mb-1">
                    <Activity className="h-3 w-3" />
                    Quick Options
                  </Label>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {SYSTEM_EXAM_OPTIONS.respiratory
                      .slice(0, 10)
                      .map((option, idx) => (
                        <Button
                          key={idx}
                          type="button"
                          variant={
                            selectedQuickOptions.respiratory?.includes(
                              option.label
                            )
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            onToggleQuickOption("respiratory", option.label)
                          }
                          className="text-xs h-6 sm:h-7 px-2 flex items-center gap-1 transition-all duration-200"
                        >
                          <span>{option.icon}</span>
                          <span className="truncate max-w-[100px] sm:max-w-[140px]">
                            {option.label}
                          </span>
                          {selectedQuickOptions.respiratory?.includes(
                            option.label
                          ) && <CheckCircle2 className="h-2.5 w-2.5" />}
                        </Button>
                      ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium flex items-center gap-1 mb-1">
                    <Radiation className="h-3 w-3" />
                    Detailed Findings
                  </Label>
                  <Textarea
                    value={prescription.respiratoryExamination || ""}
                    onChange={(e) =>
                      onUpdateField("respiratoryExamination", e.target.value)
                    }
                    className="text-xs sm:text-sm min-h-[120px] bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 border-blue-100 dark:border-blue-800 font-mono"
                    placeholder="• Breathing: Normal effort, rate 16/min, symmetrical chest expansion
• Percussion: Resonant all lung fields bilaterally
• Auscultation: Vesicular breath sounds throughout, no added sounds
• No wheeze, crackles, rhonchi, or pleural rub
• Trachea: Central with no deviation
• Chest wall: No deformities, scars, or tenderness
• Oxygen saturation: 98% on room air
• Sputum: None
• Respiratory distress: None"
                    rows={4}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Gastrointestinal System Examination */}
            <AccordionItem
              value="gastrointestinal"
              className="border border-green-100 dark:border-green-800 rounded-lg px-3 sm:px-4 bg-gradient-to-b from-green-50 to-white dark:from-gray-800 dark:to-gray-900"
            >
              <AccordionTrigger className="py-3 hover:no-underline group">
                <div className="flex items-center gap-2 w-full">
                  <div className="p-1.5 bg-green-100 dark:bg-green-900 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                    <Syringe className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-300" />
                  </div>
                  <div className="text-left flex-1">
                    <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                      Ausculation
                    </span>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Abdominal examination and digestive system
                    </div>
                  </div>
                  <div className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                    {quickOptionsCount.gastrointestinal} selected
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 space-y-3">
                <div className="mb-2">
                  <Label className="text-xs font-medium flex items-center gap-1 mb-1">
                    <Activity className="h-3 w-3" />
                    Quick Options
                  </Label>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {SYSTEM_EXAM_OPTIONS.gastrointestinal
                      .slice(0, 10)
                      .map((option, idx) => (
                        <Button
                          key={idx}
                          type="button"
                          variant={
                            selectedQuickOptions.gastrointestinal?.includes(
                              option.label
                            )
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            onToggleQuickOption(
                              "gastrointestinal",
                              option.label
                            )
                          }
                          className="text-xs h-6 sm:h-7 px-2 flex items-center gap-1 transition-all duration-200"
                        >
                          <span>{option.icon}</span>
                          <span className="truncate max-w-[100px] sm:max-w-[140px]">
                            {option.label}
                          </span>
                          {selectedQuickOptions.gastrointestinal?.includes(
                            option.label
                          ) && <CheckCircle2 className="h-2.5 w-2.5" />}
                        </Button>
                      ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium flex items-center gap-1 mb-1">
                    <Syringe className="h-3 w-3" />
                    Detailed Findings
                  </Label>
                  <Textarea
                    value={prescription.gastrointestinalExamination || ""}
                    onChange={(e) =>
                      onUpdateField(
                        "gastrointestinalExamination",
                        e.target.value
                      )
                    }
                    className="text-xs sm:text-sm min-h-[120px] bg-gradient-to-b from-green-50 to-white dark:from-gray-800 dark:to-gray-900 border-green-100 dark:border-green-800 font-mono"
                    placeholder="• Abdomen: Soft, non-tender, non-distended
• Bowel sounds: Normal frequency and character
• No hepatomegaly or splenomegaly
• No masses, hernias, or organomegaly
• No ascites (no shifting dullness)
• Renal angles: Non-tender
• Hernial orifices: Intact
• Digital rectal exam: Not indicated
• Stool: Normal color and consistency"
                    rows={4}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* General Physical Exam Summary */}
          <div className="mt-4">
            <Label
              htmlFor="physicalExam"
              className="text-xs sm:text-sm font-medium flex items-center gap-2 mb-2"
            >
              <Stethoscope className="h-3.5 w-3.5 text-amber-600" />
              General Physical Examination Summary
            </Label>
            <Textarea
              id="physicalExam"
              value={prescription.physicalExam || ""}
              onChange={(e) => onUpdateField("physicalExam", e.target.value)}
              className="mt-1.5 text-xs sm:text-sm min-h-[100px] bg-gradient-to-b from-amber-50 to-white dark:from-gray-800 dark:to-gray-900 border-amber-100 dark:border-amber-800"
              placeholder="Overall impression and significant findings from all system examinations:
• General appearance: Well-groomed, comfortable at rest
• Vital signs: Within normal limits
• Skin: Warm, dry, good turgor, no rashes or lesions
• Lymph nodes: No palpable lymphadenopathy
• HEENT: Normocephalic, atraumatic, conjunctivae pink, tympanic membranes normal
• Oral cavity: Moist mucous membranes, dentition normal
• Neck: Supple, full range of motion, no lymphadenopathy
• Extremities: No clubbing, cyanosis, or edema
• Back: Straight, no spinal tenderness"
              rows={3}
            />
            <div className="flex items-center gap-2 mt-1.5">
              <div className="text-xs text-muted-foreground pl-1">
                Summarize key findings and overall patient condition
              </div>
              <div className="text-xs text-amber-600 dark:text-amber-400 font-medium ml-auto">
                {prescription.physicalExam?.length || 0} characters
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
