// components/LaboratoryImagingSearchExample.tsx

"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, TestTube, Camera, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import LaboratoryImagingAutocomplete, {
  TestSuggestion,
} from "@/components/ui/laboratory-imaging-autocomplete";

export function LaboratoryImagingSearchExample() {
  const [selectedTest, setSelectedTest] = useState<TestSuggestion | null>(null);
  const [searchHistory, setSearchHistory] = useState<TestSuggestion[]>([]);

  const handleTestSelect = (test: TestSuggestion | null) => {
    setSelectedTest(test);

    // Add to search history if it's a new selection
    if (test && !searchHistory.find((h) => h.id === test.id)) {
      setSearchHistory((prev) => [test, ...prev.slice(0, 4)]); // Keep last 5
    }
  };

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

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">
          Laboratory Tests and Imaging Search
        </h1>
        <p className="text-muted-foreground">
          Search and select from a comprehensive database of medical tests and
          imaging procedures
        </p>
      </div>

      {/* Search Component */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test Search
          </CardTitle>
          <CardDescription>
            Start typing to search for laboratory tests, imaging procedures, and
            special tests
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LaboratoryImagingAutocomplete
            value={selectedTest}
            onValueChange={handleTestSelect}
            placeholder="Search for tests (e.g., 'blood test', 'MRI', 'CBC')..."
            limit={20}
            showPreparationInfo={true}
            showFastingIndicator={true}
          />

          <div className="text-sm text-muted-foreground">
            <p>💡 Try searching for:</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleTestSelect(null)}
              >
                CBC
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleTestSelect(null)}
              >
                MRI
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleTestSelect(null)}
              >
                Blood test
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleTestSelect(null)}
              >
                Ultrasound
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleTestSelect(null)}
              >
                CT scan
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleTestSelect(null)}
              >
                Endoscopy
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtered Examples */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TestTube className="h-4 w-4 text-blue-600" />
              Laboratory Tests Only
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <LaboratoryImagingAutocomplete
              onValueChange={(test) => console.log("Lab test selected:", test)}
              placeholder="Search lab tests..."
              filterByType={["Laboratory"]}
              limit={10}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Camera className="h-4 w-4 text-green-600" />
              Imaging Only
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <LaboratoryImagingAutocomplete
              onValueChange={(test) => console.log("Imaging selected:", test)}
              placeholder="Search imaging..."
              filterByType={["Imaging"]}
              limit={10}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-600" />
              Special Tests
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <LaboratoryImagingAutocomplete
              onValueChange={(test) =>
                console.log("Special test selected:", test)
              }
              placeholder="Search special tests..."
              filterByType={["Special Test"]}
              limit={10}
            />
          </CardContent>
        </Card>
      </div>

      {/* Selected Test Details */}
      {selectedTest && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getTypeIcon(selectedTest.type)}
              Selected Test Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{selectedTest.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={getTypeColor(selectedTest.type)}
                  >
                    {selectedTest.type}
                  </Badge>
                  {selectedTest.fasting_required && (
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      Fasting Required
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Categories</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedTest.category.map((cat) => (
                    <Badge key={cat} variant="outline" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Additional Information</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {selectedTest.sample_type && (
                    <div>Sample Type: {selectedTest.sample_type}</div>
                  )}
                  {selectedTest.turnaround_time && (
                    <div>Turnaround: {selectedTest.turnaround_time}</div>
                  )}
                  {selectedTest.cost_estimate && (
                    <div>Estimated Cost: ${selectedTest.cost_estimate}</div>
                  )}
                </div>
              </div>
            </div>

            {selectedTest.preparation &&
              selectedTest.preparation.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Preparation Instructions</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {selectedTest.preparation.map((prep, index) => (
                      <li key={index}>{prep}</li>
                    ))}
                  </ul>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* Search History */}
      {searchHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Searches</CardTitle>
            <CardDescription>Your recently selected tests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {searchHistory.map((test) => (
                <div
                  key={test.id}
                  className="flex items-center justify-between p-2 rounded-lg border hover:bg-accent cursor-pointer"
                  onClick={() => handleTestSelect(test)}
                >
                  <div className="flex items-center gap-2">
                    {getTypeIcon(test.type)}
                    <span className="font-medium">{test.name}</span>
                    <Badge
                      variant="outline"
                      className={cn("text-xs", getTypeColor(test.type))}
                    >
                      {test.type}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ID: {test.id}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default LaboratoryImagingSearchExample;
