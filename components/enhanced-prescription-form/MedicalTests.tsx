import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FlaskConical,
  FileText,
  Microscope,
  Activity,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { TestSearchForm } from "@/components/TestSearchForm";
import { Prescription } from "@/types/prescription";

interface MedicalTestsProps {
  prescription: Prescription;
  onUpdateField: (field: keyof Prescription, value: any) => void;
  selectedTestObjects: any[];
  onTestsChange: (tests: any[]) => void;
  onSelectedExamsChange: (exams: Set<string>) => void;
}

export function MedicalTests({
  prescription,
  onUpdateField,
  selectedTestObjects,
  onTestsChange,
  onSelectedExamsChange,
}: MedicalTestsProps) {
  const handleTestsAdd = (tests: any[]) => {
    onTestsChange(tests);
    const testNames = tests.map((test) => test.name);
    onUpdateField("medicalExams", testNames);
    onSelectedExamsChange(new Set(tests.map((test) => test.id)));
  };

  // Calculate test statistics
  const testStats = {
    total: selectedTestObjects.length,
    categories: selectedTestObjects.reduce((acc, test) => {
      const category = test.category || "Uncategorized";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return (
    <div className="flex flex-col sm:flex-row border-b dark:border-border/30 hover:bg-muted/20 transition-colors">
      {/* Left Sidebar */}
      <div className="w-full sm:w-1/4 p-3 sm:p-4 border-b sm:border-b-0 sm:border-r dark:border-border/30 bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/20 dark:to-gray-900">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <FlaskConical className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-300" />
          </div>
          <div>
            <div className="font-semibold text-sm sm:text-base">
              Lab Tests & Imaging
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Paraclinical Investigations
            </div>
          </div>
        </div>

        {/* Test Statistics */}
        <div className="mt-3 space-y-2">
          {/* Total Tests */}
          <div className="p-2 bg-white dark:bg-gray-800 rounded-md border border-purple-100 dark:border-purple-800">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <Microscope className="h-3 w-3" />
              Tests Ordered
            </div>
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {testStats.total}
            </div>
            {testStats.total > 0 && (
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {Object.entries(testStats.categories).map(([cat, count]) => (
                  <div key={cat} className="truncate">
                    {cat}: {count as number}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instructions Status */}
          <div className="p-2 bg-white dark:bg-gray-800 rounded-md border border-blue-100 dark:border-blue-800">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <FileText className="h-3 w-3 text-blue-500" />
              Instructions
            </div>
            <div className="text-sm font-medium mt-1">
              {prescription.examNotes ? (
                <span className="text-green-600 dark:text-green-400">
                  Provided ✓
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400">
                  Not provided
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full sm:w-3/4 p-3 sm:p-4">
        <div className="space-y-4">
          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-purple-100 dark:border-purple-800">
            <div className="text-center">
              <div className="text-xs text-gray-600 dark:text-gray-300">
                Total Tests
              </div>
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {testStats.total}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600 dark:text-gray-300">
                Blood Tests
              </div>
              <div className="text-lg font-bold text-red-600 dark:text-red-400">
                {testStats.categories["Blood Test"] || 0}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600 dark:text-gray-300">
                Imaging
              </div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {testStats.categories["Imaging"] || 0}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600 dark:text-gray-300">
                Other
              </div>
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {testStats.total -
                  (testStats.categories["Blood Test"] || 0) -
                  (testStats.categories["Imaging"] || 0)}
              </div>
            </div>
          </div>

          {/* Use Accordion for collapsible sections */}
          <Accordion type="multiple" className="w-full space-y-3">
            {/* Laboratory Tests */}
            <AccordionItem
              value="laboratory-tests"
              className="border border-purple-100 dark:border-purple-800 rounded-lg px-3 sm:px-4 bg-gradient-to-b from-purple-50 to-white dark:from-gray-800 dark:to-gray-900"
            >
              <AccordionTrigger className="py-3 hover:no-underline group">
                <div className="flex items-center gap-2 w-full">
                  <div className="p-1.5 bg-purple-100 dark:bg-purple-900 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                    <FlaskConical className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-300" />
                  </div>
                  <div className="text-left flex-1">
                    <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                      Laboratory Tests
                    </span>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Search and select diagnostic tests
                    </div>
                  </div>
                  {selectedTestObjects.length > 0 && (
                    <div className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                      {selectedTestObjects.length} selected
                    </div>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 space-y-3">
                <div>
                  <Label className="text-xs font-medium flex items-center gap-1 mb-2">
                    <Activity className="h-3.5 w-3.5" />
                    Test Search & Selection
                  </Label>
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-800">
                    <TestSearchForm
                      mode="multiple"
                      selectedTests={selectedTestObjects}
                      onTestsAdd={handleTestsAdd}
                      placeholder="Search for laboratory tests (e.g., CBC, LFT, Lipid Profile)..."
                      showQuickAdd={true}
                      showFilters={true}
                    />
                  </div>
                </div>

                {/* Selected Tests Preview */}
                {selectedTestObjects.length > 0 && (
                  <div>
                    <Label className="text-xs font-medium flex items-center gap-1 mb-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      Selected Tests ({selectedTestObjects.length})
                    </Label>
                    <div className="max-h-32 overflow-y-auto p-2 bg-gradient-to-b from-green-50 to-white dark:from-gray-800 dark:to-gray-900 rounded border border-green-100 dark:border-green-800">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {selectedTestObjects.map((test, index) => (
                          <div
                            key={test.id || index}
                            className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-gray-800 rounded border"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                            <div className="text-xs truncate">{test.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Test Notes & Instructions */}
            <AccordionItem
              value="test-notes"
              className="border border-green-100 dark:border-green-800 rounded-lg px-3 sm:px-4 bg-gradient-to-b from-green-50 to-white dark:from-gray-800 dark:to-gray-900"
            >
              <AccordionTrigger className="py-3 hover:no-underline group">
                <div className="flex items-center gap-2 w-full">
                  <div className="p-1.5 bg-green-100 dark:bg-green-900 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-300" />
                  </div>
                  <div className="text-left flex-1">
                    <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                      Test Notes & Instructions
                    </span>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Special requirements and follow-up
                    </div>
                  </div>
                  {prescription.examNotes && (
                    <div className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                      Has notes
                    </div>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs font-medium flex items-center gap-1 mb-2">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                      Special Instructions for Tests
                    </Label>
                    <Textarea
                      id="examNotes"
                      value={prescription.examNotes || ""}
                      onChange={(e) =>
                        onUpdateField("examNotes", e.target.value)
                      }
                      className="text-xs sm:text-sm min-h-[120px] bg-gradient-to-b from-amber-50 to-white dark:from-gray-800 dark:to-gray-900 border-amber-100 dark:border-amber-800"
                      placeholder="• Fasting required: 8-12 hours for blood glucose, lipid profile
• Hydration: Patient should be well-hydrated for urine tests
• Timing: Morning fasting samples preferred
• Medications: Hold specific medications as advised
• Follow-up: Schedule appointment in 1 week for results review
• Emergency: Report immediately if severe symptoms develop
• Preparation: Specific preparation for imaging studies
• Consent: Ensure informed consent for invasive tests
• Safety: Pregnancy test required before radiology for women of childbearing age"
                      rows={4}
                    />
                  </div>

                  {/* Common Instructions Quick Add */}
                  <div>
                    <Label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Quick Add Common Instructions:
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        "Fasting required",
                        "Morning sample preferred",
                        "Follow-up in 1 week",
                        "Drink plenty of water",
                        "Avoid strenuous exercise",
                      ].map((instruction, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            const currentNotes = prescription.examNotes || "";
                            const newNote = currentNotes
                              ? currentNotes + `\n• ${instruction}`
                              : `• ${instruction}`;
                            onUpdateField("examNotes", newNote);
                          }}
                          className="text-xs px-2.5 py-1 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded transition-colors"
                        >
                          + {instruction}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <div className="text-xs text-muted-foreground pl-1">
                      Add specific requirements, timing, and follow-up
                      instructions
                    </div>
                    <div className="text-xs text-amber-600 dark:text-amber-400 font-medium ml-auto">
                      {prescription.examNotes?.length || 0} characters
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Summary Section */}
          {selectedTestObjects.length > 0 && (
            <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-purple-100 dark:border-purple-800">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                Test Order Summary
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="text-xs">
                  <div className="font-medium text-gray-700 dark:text-gray-300">
                    Selected Tests:
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {selectedTestObjects.slice(0, 5).map((test, index) => (
                      <div
                        key={test.id || index}
                        className="flex items-center gap-1"
                      >
                        <div className="w-1 h-1 rounded-full bg-purple-500"></div>
                        <span className="truncate">{test.name}</span>
                      </div>
                    ))}
                    {selectedTestObjects.length > 5 && (
                      <div className="text-muted-foreground">
                        + {selectedTestObjects.length - 5} more tests
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs">
                  <div className="font-medium text-gray-700 dark:text-gray-300">
                    Estimated Timeline:
                  </div>
                  <div className="mt-1">
                    <div className="flex items-center justify-between">
                      <span>Routine tests:</span>
                      <span className="font-medium">24-48 hours</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Specialized tests:</span>
                      <span className="font-medium">3-5 days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Imaging results:</span>
                      <span className="font-medium">2-3 days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
