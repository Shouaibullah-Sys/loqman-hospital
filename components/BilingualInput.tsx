// components/BilingualInput.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Globe, Languages } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  translateMedicationField,
  hasPersianTranslation,
} from "@/lib/medicationTimingTranslations";

interface BilingualInputProps {
  label: string;
  englishValue: string;
  persianValue: string;
  onEnglishChange: (value: string) => void;
  onPersianChange: (value: string) => void;
  placeholder?: string;
  persianPlaceholder?: string;
  className?: string;
  showAutoTranslate?: boolean;
  translationKey?: string;
}

export function BilingualInput({
  label,
  englishValue,
  persianValue,
  onEnglishChange,
  onPersianChange,
  placeholder = "",
  persianPlaceholder = "",
  className = "",
  showAutoTranslate = true,
  translationKey,
}: BilingualInputProps) {
  const [activeLanguage, setActiveLanguage] = useState<"english" | "persian">(
    "english"
  );

  const handleAutoTranslate = () => {
    if (translationKey && englishValue) {
      const translation = translateMedicationField(englishValue);
      if (translation !== englishValue) {
        onPersianChange(translation);
      }
    }
  };

  const canAutoTranslate =
    showAutoTranslate &&
    translationKey &&
    englishValue &&
    hasPersianTranslation(englishValue) &&
    !persianValue;

  return (
    <TooltipProvider>
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">{label}</Label>
          <div className="flex items-center gap-2">
            {canAutoTranslate && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAutoTranslate}
                    className="h-7 px-2 text-xs"
                  >
                    <Languages className="h-3 w-3 mr-1" />
                    Auto-translate
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to auto-translate from English to Persian</p>
                </TooltipContent>
              </Tooltip>
            )}
            <div className="flex rounded-md border">
              <Button
                type="button"
                variant={activeLanguage === "english" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveLanguage("english")}
                className="rounded-r-none border-r h-7 px-3 text-xs"
              >
                <Globe className="h-3 w-3 mr-1" />
                EN
              </Button>
              <Button
                type="button"
                variant={activeLanguage === "persian" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveLanguage("persian")}
                className="rounded-l-none h-7 px-3 text-xs"
              >
                <Globe className="h-3 w-3 mr-1" />
                FA
              </Button>
            </div>
          </div>
        </div>

        {activeLanguage === "english" ? (
          <Input
            value={englishValue}
            onChange={(e) => onEnglishChange(e.target.value)}
            placeholder={placeholder}
            className="text-left"
          />
        ) : (
          <Input
            value={persianValue}
            onChange={(e) => onPersianChange(e.target.value)}
            placeholder={persianPlaceholder || placeholder}
            className="text-right font-vazirmatn"
            dir="rtl"
          />
        )}

        {/* Show both values in preview */}
        {(englishValue || persianValue) && (
          <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
            <div className="flex justify-between">
              <span>EN: {englishValue || "-"}</span>
              <span>FA: {persianValue || "-"}</span>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
