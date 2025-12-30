// Footer component for the enhanced prescription form
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardFooter } from "@/components/ui/card";
import { Save } from "lucide-react";
import { Prescription } from "@/types/prescription";

interface FooterProps {
  prescription: Prescription;
  isSaving?: boolean;
  onSave: () => Promise<void>;
  onCancel: () => void;
}

export function Footer({
  prescription,
  isSaving = false,
  onSave,
  onCancel,
}: FooterProps) {
  const medicinesCount = prescription.medicines?.length || 0;

  return (
    <CardFooter className="border-t dark:border-border/50 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <div
              className={`h-2 w-2 rounded-full ${
                isSaving ? "bg-amber-500 animate-pulse" : "bg-green-500"
              }`}
            />
            <span className="text-muted-foreground">
              {isSaving ? "Saving..." : "Ready to save"}
            </span>
          </div>
          <Badge variant="outline" className="text-xs">
            <span className="font-medium">{medicinesCount} medication(s)</span>
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
            className="h-8 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm"
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="h-8 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            {isSaving ? (
              <>
                <div className="h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Save Prescription
              </>
            )}
          </Button>
        </div>
      </div>
    </CardFooter>
  );
}
