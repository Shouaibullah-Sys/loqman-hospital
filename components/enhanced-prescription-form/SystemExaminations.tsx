// components/SystemExaminations.tsx
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
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
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  ChevronRight,
  FileText,
} from "lucide-react";
import { Prescription } from "@/types/prescription";
import { cn } from "@/lib/utils";
import { MultiTextInput } from "../MultiTextInput";

interface SystemExaminationsProps {
  prescription: Prescription;
  onUpdateField: (field: keyof Prescription, value: any) => void;
}

export function SystemExaminations({
  prescription,
  onUpdateField,
}: SystemExaminationsProps) {
  // Local state for each system examination
  const [localCNS, setLocalCNS] = useState<string[]>([]);
  const [localCardiovascular, setLocalCardiovascular] = useState<string[]>([]);
  const [localRespiratory, setLocalRespiratory] = useState<string[]>([]);
  const [localGastrointestinal, setLocalGastrointestinal] = useState<string[]>(
    []
  );

  // Active section state
  const [activeSection, setActiveSection] = useState<
    "cns" | "cardiovascular" | "respiratory" | "gastrointestinal"
  >("cns");

  // Initialize from prescription data
  useEffect(() => {
    const parseTextToArray = (text: string | undefined): string[] => {
      if (!text || typeof text !== "string") return [];

      if (Array.isArray(text)) return text;

      const trimmedText = text.trim();
      if (!trimmedText) return [];

      // Handle different formats
      if (/^\d+\.\s+.+/m.test(trimmedText)) {
        return trimmedText
          .split("\n")
          .map((line) => {
            const match = line.match(/^\d+\.\s+(.+)$/);
            return match ? match[1].trim() : line.trim();
          })
          .filter((item) => item.length > 0);
      }

      if (/^[•\-*]\s+.+/m.test(trimmedText)) {
        return trimmedText
          .split("\n")
          .map((line) => line.replace(/^[•\-*]\s+/, "").trim())
          .filter((item) => item.length > 0);
      }

      if (trimmedText.includes(",")) {
        return trimmedText
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
      }

      // Treat as single item
      return [trimmedText];
    };

    // Parse each system examination
    setLocalCNS(parseTextToArray(prescription.cnsExamination || undefined));
    setLocalCardiovascular(
      parseTextToArray(prescription.cardiovascularExamination || undefined)
    );
    setLocalRespiratory(
      parseTextToArray(prescription.respiratoryExamination || undefined)
    );
    setLocalGastrointestinal(
      parseTextToArray(prescription.gastrointestinalExamination || undefined)
    );
  }, [
    prescription.cnsExamination,
    prescription.cardiovascularExamination,
    prescription.respiratoryExamination,
    prescription.gastrointestinalExamination,
  ]);

  // Update handlers for each system
  const updateCNS = (findings: string[]) => {
    setLocalCNS(findings);
    onUpdateField("cnsExamination", findings.join(", "));
  };

  const updateCardiovascular = (findings: string[]) => {
    setLocalCardiovascular(findings);
    onUpdateField("cardiovascularExamination", findings.join(", "));
  };

  const updateRespiratory = (findings: string[]) => {
    setLocalRespiratory(findings);
    onUpdateField("respiratoryExamination", findings.join(", "));
  };

  const updateGastrointestinal = (findings: string[]) => {
    setLocalGastrointestinal(findings);
    onUpdateField("gastrointestinalExamination", findings.join(", "));
  };

  // Calculate total items
  const totalItems =
    localCNS.length +
    localCardiovascular.length +
    localRespiratory.length +
    localGastrointestinal.length;

  return (
    <div
      id="system-examinations"
      className="group flex flex-col sm:flex-row border-2 border-border/50 dark:border-border rounded-xl overflow-hidden hover:border-border transition-all duration-300 bg-gradient-to-br from-background to-card/30 dark:from-background dark:to-card/10 shadow-sm hover:shadow-md medical-card"
    >
      {/* Left Sidebar */}
      <div
        className={cn(
          "w-full sm:w-1/4 p-4 sm:p-5 border-b sm:border-b-0 sm:border-r border-border/30 transition-all duration-300",
          "bg-gradient-to-b from-emerald-900/10 to-background dark:from-emerald-950/20 dark:to-background",
          activeSection === "cns" && "bg-emerald-900/20",
          activeSection === "cardiovascular" && "bg-red-900/20",
          activeSection === "respiratory" && "bg-blue-900/20",
          activeSection === "gastrointestinal" && "bg-green-900/20"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-xl shadow-sm">
              <BrainCircuit className="h-5 w-5 text-emerald-50" />
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base tracking-tight text-foreground">
                System Examinations
              </div>
              <div className="text-xs text-muted-foreground font-medium mt-0.5">
                Physical & Clinical Findings
              </div>
            </div>
          </div>

          {/* Examination Stats */}
          <div className="mb-6">
            <div className="space-y-3">
              {/* Overall Progress */}
              <div className="p-3 bg-card/50 dark:bg-card/30 rounded-lg border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                    <ClipboardCheck className="h-3.5 w-3.5 text-emerald-500" />
                    Examination Progress
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/40 rounded-full">
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                      {totalItems > 0 ? "In Progress" : "Not Started"}
                    </span>
                  </div>
                </div>
                <div className="text-sm font-medium text-foreground">
                  {totalItems} findings documented
                </div>
                {totalItems > 0 && (
                  <div className="mt-2 flex items-center">
                    <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-400 to-emerald-300 h-full transition-all duration-500"
                        style={{
                          width: `${Math.min(totalItems * 10, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 ml-2">
                      {Math.min(totalItems * 10, 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* System Status Cards */}
              {[
                {
                  key: "cns",
                  label: "Inspection",
                  icon: Brain,
                  color: "purple",
                  count: localCNS.length,
                },
                {
                  key: "cardiovascular",
                  label: "Palpation",
                  icon: HeartPulse,
                  color: "red",
                  count: localCardiovascular.length,
                },
                {
                  key: "respiratory",
                  label: "Percussion",
                  icon: Radiation,
                  color: "blue",
                  count: localRespiratory.length,
                },
                {
                  key: "gastrointestinal",
                  label: "Auscultation",
                  icon: Syringe,
                  color: "green",
                  count: localGastrointestinal.length,
                },
              ].map((system) => (
                <div
                  key={system.key}
                  className="p-3 bg-card/50 dark:bg-card/30 rounded-lg border border-border/50 cursor-pointer hover:bg-card/70 transition-colors"
                  onClick={() => setActiveSection(system.key as any)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                      <system.icon
                        className={cn(
                          "h-3.5 w-3.5",
                          system.color === "red" && "text-red-500",
                          system.color === "blue" && "text-blue-500",
                          system.color === "green" && "text-green-500",
                          system.color === "purple" && "text-purple-500"
                        )}
                      />
                      {system.label}
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-full",
                        system.color === "red" &&
                          "bg-red-100 dark:bg-red-900/40",
                        system.color === "blue" &&
                          "bg-blue-100 dark:bg-blue-900/40",
                        system.color === "green" &&
                          "bg-green-100 dark:bg-green-900/40",
                        system.color === "purple" &&
                          "bg-purple-100 dark:bg-purple-900/40"
                      )}
                    >
                      {system.count > 0 ? (
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span
                        className={cn(
                          "text-xs font-medium",
                          system.count > 0
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "text-muted-foreground"
                        )}
                      >
                        {system.count > 0 ? "Recorded" : "Pending"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-foreground">
                      {system.count} findings
                    </div>
                    <div
                      className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        system.count > 0
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {system.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tips */}
          {/* System Summary */}
          <div className="mt-auto pt-4 border-t border-border/30">
            <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5" />
              System Summary
            </div>
            <div className="text-xs text-muted-foreground">
              {totalItems} findings across all systems
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={cn(
          "w-full sm:w-3/4 p-4 sm:p-5 transition-all duration-300",
          activeSection === "cns" &&
            "bg-gradient-to-br from-purple-50/50 to-background dark:from-purple-950/10 dark:to-background",
          activeSection === "cardiovascular" &&
            "bg-gradient-to-br from-red-50/50 to-background dark:from-red-950/10 dark:to-background",
          activeSection === "respiratory" &&
            "bg-gradient-to-br from-blue-50/50 to-background dark:from-blue-950/10 dark:to-background",
          activeSection === "gastrointestinal" &&
            "bg-gradient-to-br from-green-50/50 to-background dark:from-green-950/10 dark:to-background"
        )}
      >
        <div className="mb-4">
          <Label className="text-sm font-bold flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-lg">
              <BrainCircuit className="h-4 w-4 text-emerald-50" />
            </div>
            System Examinations
            <div className="ml-auto flex items-center gap-2">
              <div className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full font-medium">
                {totalItems} findings
              </div>
            </div>
          </Label>
          <p className="text-xs text-muted-foreground mt-1 pl-1">
            Document examination findings. Type and press Enter to add findings.
          </p>
        </div>

        <Accordion type="multiple" className="w-full space-y-4">
          {/* CNS & Neurological Examination */}
          <AccordionItem
            value="cns"
            className="border-2 border-border/30 rounded-lg px-4 bg-gradient-to-b from-card/50 to-background/50 medical-card"
          >
            <AccordionTrigger
              className="py-4 hover:no-underline group hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-colors"
              onClick={() => setActiveSection("cns")}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-400 rounded-lg group-hover:from-purple-500/90 group-hover:to-purple-400/90 transition-colors">
                  <Brain className="h-5 w-5 text-purple-50" />
                </div>
                <div className="text-left flex-1">
                  <span className="text-base font-bold text-foreground">
                    Inspection
                  </span>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Consciousness, motor, sensory, and reflexes
                  </div>
                </div>
                <div className="text-xs font-medium px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                  {localCNS.length} finding{localCNS.length !== 1 ? "s" : ""}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-5">
              <MultiTextInput
                label={
                  <span className="flex items-center gap-1">
                    <Brain className="h-3.5 w-3.5 text-purple-500" />
                    CNS Findings
                  </span>
                }
                values={localCNS}
                onChange={updateCNS}
                placeholder="e.g., Consciousness: Alert and oriented, Motor: Normal power 5/5 all limbs"
                tagColor="purple"
                description="Type a finding and press Enter. For multiple findings, add them separately."
                inputClassName="text-xs sm:text-sm h-8 sm:h-10 bg-gradient-to-r from-purple-50 to-white dark:from-gray-800 dark:to-gray-900 border-purple-200 dark:border-purple-800 focus:border-purple-500"
              />
            </AccordionContent>
          </AccordionItem>

          {/* Cardiovascular System Examination */}
          <AccordionItem
            value="cardiovascular"
            className="border-2 border-border/30 rounded-lg px-4 bg-gradient-to-b from-card/50 to-background/50 medical-card"
          >
            <AccordionTrigger
              className="py-4 hover:no-underline group hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-colors"
              onClick={() => setActiveSection("cardiovascular")}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="p-2 bg-gradient-to-br from-red-500 to-red-400 rounded-lg group-hover:from-red-500/90 group-hover:to-red-400/90 transition-colors">
                  <HeartPulse className="h-5 w-5 text-red-50" />
                </div>
                <div className="text-left flex-1">
                  <span className="text-base font-bold text-foreground">
                    Palpation
                  </span>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Heart sounds, pulses, and circulation
                  </div>
                </div>
                <div className="text-xs font-medium px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                  {localCardiovascular.length} finding
                  {localCardiovascular.length !== 1 ? "s" : ""}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-5">
              <MultiTextInput
                label={
                  <span className="flex items-center gap-1">
                    <HeartPulse className="h-3.5 w-3.5 text-red-500" />
                    Cardiovascular Findings
                  </span>
                }
                values={localCardiovascular}
                onChange={updateCardiovascular}
                placeholder="e.g., Heart sounds: S1, S2 normal, Pulse: Regular rhythm 72 bpm"
                tagColor="red"
                description="Type a finding and press Enter. For multiple findings, add them separately."
                inputClassName="text-xs sm:text-sm h-8 sm:h-10 bg-gradient-to-r from-red-50 to-white dark:from-gray-800 dark:to-gray-900 border-red-200 dark:border-red-800 focus:border-red-500"
              />
            </AccordionContent>
          </AccordionItem>

          {/* Respiratory System Examination */}
          <AccordionItem
            value="respiratory"
            className="border-2 border-border/30 rounded-lg px-4 bg-gradient-to-b from-card/50 to-background/50 medical-card"
          >
            <AccordionTrigger
              className="py-4 hover:no-underline group hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors"
              onClick={() => setActiveSection("respiratory")}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-400 rounded-lg group-hover:from-blue-500/90 group-hover:to-blue-400/90 transition-colors">
                  <Radiation className="h-5 w-5 text-blue-50" />
                </div>
                <div className="text-left flex-1">
                  <span className="text-base font-bold text-foreground">
                    Percussion
                  </span>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Breathing patterns, sounds, and oxygen status
                  </div>
                </div>
                <div className="text-xs font-medium px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                  {localRespiratory.length} finding
                  {localRespiratory.length !== 1 ? "s" : ""}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-5">
              <MultiTextInput
                label={
                  <span className="flex items-center gap-1">
                    <Radiation className="h-3.5 w-3.5 text-blue-500" />
                    Respiratory Findings
                  </span>
                }
                values={localRespiratory}
                onChange={updateRespiratory}
                placeholder="e.g., Breathing: Normal effort, Auscultation: Vesicular breath sounds"
                tagColor="blue"
                description="Type a finding and press Enter. For multiple findings, add them separately."
                inputClassName="text-xs sm:text-sm h-8 sm:h-10 bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 border-blue-200 dark:border-blue-800 focus:border-blue-500"
              />
            </AccordionContent>
          </AccordionItem>

          {/* Gastrointestinal System Examination */}
          <AccordionItem
            value="gastrointestinal"
            className="border-2 border-border/30 rounded-lg px-4 bg-gradient-to-b from-card/50 to-background/50 medical-card"
          >
            <AccordionTrigger
              className="py-4 hover:no-underline group hover:bg-green-50/50 dark:hover:bg-green-950/20 transition-colors"
              onClick={() => setActiveSection("gastrointestinal")}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="p-2 bg-gradient-to-br from-green-500 to-green-400 rounded-lg group-hover:from-green-500/90 group-hover:to-green-400/90 transition-colors">
                  <Syringe className="h-5 w-5 text-green-50" />
                </div>
                <div className="text-left flex-1">
                  <span className="text-base font-bold text-foreground">
                    Auscultation
                  </span>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Abdominal examination and digestive system
                  </div>
                </div>
                <div className="text-xs font-medium px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                  {localGastrointestinal.length} finding
                  {localGastrointestinal.length !== 1 ? "s" : ""}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-5">
              <MultiTextInput
                label={
                  <span className="flex items-center gap-1">
                    <Syringe className="h-3.5 w-3.5 text-green-500" />
                    Gastrointestinal Findings
                  </span>
                }
                values={localGastrointestinal}
                onChange={updateGastrointestinal}
                placeholder="e.g., Abdomen: Soft and non-tender, Bowel sounds: Normal"
                tagColor="green"
                description="Type a finding and press Enter. For multiple findings, add them separately."
                inputClassName="text-xs sm:text-sm h-8 sm:h-10 bg-gradient-to-r from-green-50 to-white dark:from-gray-800 dark:to-gray-900 border-green-200 dark:border-green-800 focus:border-green-500"
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
