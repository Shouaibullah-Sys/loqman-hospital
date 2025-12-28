// components/ui/laboratory-imaging-autocomplete.tsx - UPDATED

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteControl,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompleteIcon,
  AutocompleteClear,
} from "@/components/ui/base-autocomplete";
import { Badge } from "@/components/ui/badge";
import { Clock, TestTube, Camera, Zap } from "lucide-react";

export interface TestSuggestion {
  id: string;
  name: string;
  category: string[];
  type: "Laboratory" | "Imaging" | "Special Test" | "Procedure";
  preparation?: string[];
  fasting_required?: boolean;
  insurance_coverage?: boolean;
  cost_estimate?: number;
  turnaround_time?: string;
  sample_type?: string;
}

export interface LaboratoryImagingAutocompleteProps {
  value?: TestSuggestion | null;
  onValueChange?: (value: TestSuggestion | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  limit?: number;
  filterByType?: ("Laboratory" | "Imaging" | "Special Test" | "Procedure")[];
  showPreparationInfo?: boolean;
  showFastingIndicator?: boolean;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "Laboratory":
      return <TestTube className="h-4 w-4" />;
    case "Imaging":
      return <Camera className="h-4 w-4" />;
    case "Special Test":
      return <Zap className="h-4 w-4" />;
    default:
      return <TestTube className="h-4 w-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "Laboratory":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "Imaging":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "Special Test":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
  }
};

export function LaboratoryImagingAutocomplete({
  value,
  onValueChange,
  placeholder = "Search Laboratory Tests and Imaging...",
  className,
  disabled = false,
  limit = 15,
  filterByType,
  showPreparationInfo = true,
  showFastingIndicator = true,
}: LaboratoryImagingAutocompleteProps) {
  const [inputValue, setInputValue] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<TestSuggestion[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Debounced search function
  const searchTests = React.useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/autocomplete/tests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: query,
            limit,
          }),
        });

        if (!response.ok) {
          throw new Error(`Search failed: ${response.statusText}`);
        }

        const data = await response.json();
        let filteredSuggestions = data.suggestions || [];

        // Apply type filter if specified
        if (filterByType && filterByType.length > 0) {
          filteredSuggestions = filteredSuggestions.filter(
            (suggestion: TestSuggestion) =>
              filterByType.includes(suggestion.type)
          );
        }

        setSuggestions(filteredSuggestions);
      } catch (err) {
        console.error("Laboratory/Imaging search error:", err);
        setError(err instanceof Error ? err.message : "Search failed");
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [limit, filterByType]
  );

  // Debounce search
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputValue) {
        searchTests(inputValue);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputValue, searchTests]);

  // Update input when value prop changes
  React.useEffect(() => {
    if (value) {
      setInputValue(value.name);
    } else {
      setInputValue("");
    }
  }, [value]);

  // Group suggestions by type
  const groupedSuggestions = React.useMemo(() => {
    const groups: Record<string, TestSuggestion[]> = {};
    suggestions.forEach((suggestion) => {
      if (!groups[suggestion.type]) {
        groups[suggestion.type] = [];
      }
      groups[suggestion.type].push(suggestion);
    });
    return groups;
  }, [suggestions]);

  const handleValueChange = (selectedId: string) => {
    const selectedSuggestion = suggestions.find((s) => s.id === selectedId);
    if (selectedSuggestion) {
      onValueChange?.(selectedSuggestion);
      setInputValue(selectedSuggestion.name);
      setSuggestions([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Clear selection when user types
    if (value && newValue !== value.name) {
      onValueChange?.(null);
    }
  };

  const handleClear = () => {
    setInputValue("");
    onValueChange?.(null);
    setSuggestions([]);
  };

  const formatPreparation = (preparation?: string[]) => {
    if (!preparation || preparation.length === 0) return null;
    return preparation.slice(0, 2).join(", "); // Show first 2 preparation items
  };

  return (
    <div className={cn("relative", className)}>
      <Autocomplete
        value={value?.id}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <AutocompleteControl>
          <div className="relative flex items-center">
            <AutocompleteInput
              placeholder={placeholder}
              value={inputValue}
              onChange={handleInputChange}
              disabled={disabled}
              className="pr-20"
            />
            <AutocompleteIcon className="absolute right-12 h-4 w-4 text-muted-foreground" />
            {inputValue && (
              <AutocompleteClear onClick={handleClear} className="right-2" />
            )}
          </div>
        </AutocompleteControl>

        <AutocompleteContent
          showBackdrop={false}
          className="w-[var(--anchor-width)]"
        >
          {isLoading && (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              Searching tests...
            </div>
          )}

          {error && (
            <div className="px-4 py-3 text-sm text-destructive">{error}</div>
          )}

          {!isLoading && !error && suggestions.length === 0 && inputValue && (
            <AutocompleteEmpty>
              No tests found for "{inputValue}"
            </AutocompleteEmpty>
          )}

          {!isLoading && !error && suggestions.length > 0 && (
            <AutocompleteList>
              {Object.entries(groupedSuggestions).map(([type, tests]) => (
                <AutocompleteGroup key={type}>
                  <AutocompleteGroupLabel className="flex items-center gap-2">
                    {getTypeIcon(type)}
                    {type}
                  </AutocompleteGroupLabel>
                  {tests.map((test) => (
                    <AutocompleteItem key={test.id} value={test.id}>
                      <div className="flex flex-col w-full">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {test.name}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-xs px-1.5 py-0.5",
                                  getTypeColor(test.type)
                                )}
                              >
                                {test.type}
                              </Badge>

                              {showFastingIndicator &&
                                test.fasting_required && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs px-1.5 py-0.5"
                                  >
                                    <Clock className="h-3 w-3 mr-1" />
                                    Fasting
                                  </Badge>
                                )}
                            </div>
                          </div>
                        </div>

                        {/* Categories */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {test.category.slice(0, 3).map((cat) => (
                            <Badge
                              key={cat}
                              variant="outline"
                              className="text-xs px-1.5 py-0.5 opacity-70"
                            >
                              {cat}
                            </Badge>
                          ))}
                          {test.category.length > 3 && (
                            <Badge
                              variant="outline"
                              className="text-xs px-1.5 py-0.5 opacity-50"
                            >
                              +{test.category.length - 3} more
                            </Badge>
                          )}
                        </div>

                        {/* Preparation info */}
                        {showPreparationInfo &&
                          test.preparation &&
                          test.preparation.length > 0 && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              <span className="font-medium">Prep: </span>
                              {formatPreparation(test.preparation)}
                              {test.preparation.length > 2 && "..."}
                            </div>
                          )}

                        {/* Additional info */}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          {test.sample_type && (
                            <span>Sample: {test.sample_type}</span>
                          )}
                          {test.turnaround_time && (
                            <span>• {test.turnaround_time}</span>
                          )}
                          {test.cost_estimate && (
                            <span>• ${test.cost_estimate}</span>
                          )}
                        </div>
                      </div>
                    </AutocompleteItem>
                  ))}
                </AutocompleteGroup>
              ))}
            </AutocompleteList>
          )}
        </AutocompleteContent>
      </Autocomplete>
    </div>
  );
}

export default LaboratoryImagingAutocomplete;
