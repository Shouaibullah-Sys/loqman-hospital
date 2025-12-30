// Header component for the enhanced prescription form
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  FileText,
  CheckCircle,
  FlaskConical,
  Save,
} from "lucide-react";
import { Prescription } from "@/types/prescription";

interface HeaderComponentProps {
  prescription: Prescription;
  isSaving?: boolean;
  onSave: () => Promise<void>;
  onCancel: () => void;
}

export function HeaderComponent({
  prescription,
  isSaving = false,
  onSave,
  onCancel,
}: HeaderComponentProps) {
  // Format date for display
  const formattedDate = new Date(prescription.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const selectedExams = new Set(prescription.medicalExams || []);
  const medicinesCount = prescription.medicines?.length || 0;

  return (
    <Card className="border-primary/20 dark:border-primary/30 bg-gradient-to-r from-primary/5 to-card w-full">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-primary/10 rounded-xl">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">
                Prescription and Examination Form
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1 sm:mt-2">
                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{formattedDate}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  #{prescription.id?.substring(0, 8) || "NEW"}
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-green-50 text-green-700 text-xs"
                >
                  <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                  Active
                </Badge>
                {selectedExams.size > 0 && (
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 text-xs"
                  >
                    <FlaskConical className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                    {selectedExams.size} Tests
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <div
                className={`h-2 w-2 sm:h-3 sm:w-3 rounded-full ${
                  isSaving ? "bg-amber-500 animate-pulse" : "bg-green-500"
                }`}
              />
              <span>{isSaving ? "Saving..." : "Ready to save"}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isSaving}
                className="h-8 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={onSave}
                disabled={isSaving}
                className="h-8 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                {isSaving ? (
                  <>
                    <div className="h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-1 sm:mr-2" />
                    Saving
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
