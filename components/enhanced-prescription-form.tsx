// components/enhanced-prescription-form.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  Save,
  Edit3,
  User,
  Stethoscope,
  Pill,
  Sparkles,
  Brain,
  Eye,
  Download,
  DollarSign,
  Calendar,
  Phone,
  AlertCircle,
  Heart,
  Thermometer,
  Activity,
  Weight,
  Clock,
  FileText,
  Printer,
  ChevronRight,
} from "lucide-react";
import { Prescription, FormMedicine } from "@/types/prescription";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EnhancedPrescriptionFormProps {
  prescription: Prescription;
  onSave: (prescription: Prescription) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

export function EnhancedPrescriptionForm({
  prescription,
  onSave,
  onCancel,
  isSaving = false,
}: EnhancedPrescriptionFormProps) {
  const [editablePrescription, setEditablePrescription] =
    useState<Prescription>(() => {
      return initializePrescription(prescription);
    });

  const [activeSection, setActiveSection] = useState<string>("patient");

  useEffect(() => {
    setEditablePrescription(initializePrescription(prescription));
  }, [prescription]);

  function initializePrescription(prescription: Prescription): Prescription {
    const initialPrescription = Array.isArray(prescription.medicines)
      ? prescription.medicines.map((med) => ({
          ...med,
          id: med.id || Math.random().toString(36).substr(2, 9),
          dosage: med.dosage || "",
          form: med.form || "tablet",
          route: med.route || "oral",
          timing: med.timing || "after_meal",
          withFood: med.withFood || false,
          frequency: med.frequency || "",
          duration: med.duration || "",
          instructions: med.instructions || "",
          notes: med.notes || "",
        }))
      : [];

    const safePrescription =
      initialPrescription.length > 0
        ? initialPrescription
        : [createEmptyMedicine()];

    return {
      ...prescription,
      patientName: prescription.patientName || "",
      diagnosis: prescription.diagnosis || "",
      medicines: safePrescription,
      patientAge: prescription.patientAge || "",
      patientGender: prescription.patientGender || "",
      patientPhone: prescription.patientPhone || "",
      pulseRate: prescription.pulseRate || "",
      bloodPressure: prescription.bloodPressure || "",
      temperature: prescription.temperature || "",
      respiratoryRate: prescription.respiratoryRate || "",
      oxygenSaturation: prescription.oxygenSaturation || "",
      allergies: Array.isArray(prescription.allergies)
        ? prescription.allergies
        : [],
      currentMedications: Array.isArray(prescription.currentMedications)
        ? prescription.currentMedications
        : [],
      pastMedicalHistory: prescription.pastMedicalHistory || "",
      instructions:
        prescription.instructions ||
        "Adequate rest and regular medication intake",
      followUp:
        prescription.followUp || "Return if no improvement after 3 days",
      restrictions: prescription.restrictions || "",
      clinicName: prescription.clinicName || "کلینیک تخصصی",
      doctorFree: prescription.doctorFree || "",
      chiefComplaint: prescription.chiefComplaint || "",
      doctorName: prescription.doctorName || "dr. Ahmad Farid ",
      createdAt: prescription.createdAt || new Date().toISOString(),
    };
  }

  function createEmptyMedicine(): FormMedicine {
    return {
      id: Math.random().toString(36).substr(2, 9),
      medicine: "",
      dosage: "",
      form: "tablet",
      frequency: "",
      duration: "",
      route: "oral",
      timing: "after_meal",
      withFood: false,
      instructions: "",
      notes: "",
      prescriptionId: "",
    };
  }

  const updateField = (field: keyof Prescription, value: any) => {
    setEditablePrescription((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateMedicine = (
    index: number,
    field: keyof FormMedicine,
    value: any
  ) => {
    const updatedMeds = [...editablePrescription.medicines];
    updatedMeds[index] = { ...updatedMeds[index], [field]: value };
    setEditablePrescription((prev) => ({
      ...prev,
      medicines: updatedMeds,
    }));
  };

  const addMedicine = () => {
    const newMedicine = createEmptyMedicine();
    setEditablePrescription((prev) => ({
      ...prev,
      medicines: [...prev.medicines, newMedicine],
    }));
  };

  const removeMedicine = (index: number) => {
    if (editablePrescription.medicines.length <= 1) {
      const updatedMeds = [...editablePrescription.medicines];
      updatedMeds[index] = createEmptyMedicine();
      setEditablePrescription((prev) => ({
        ...prev,
        medicines: updatedMeds,
      }));
      return;
    }

    setEditablePrescription((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!editablePrescription.patientName?.trim()) {
      alert("Please enter patient name");
      return;
    }

    if (!editablePrescription.diagnosis.trim()) {
      alert("Please enter patient diagnosis");
      return;
    }

    const hasEmptyMedicines = editablePrescription.medicines.some(
      (med) =>
        !med.medicine?.trim() ||
        !med.dosage?.trim() ||
        !med.frequency?.trim() ||
        !med.duration?.trim()
    );

    if (hasEmptyMedicines) {
      alert("Please fill all required medication fields");
      return;
    }

    await onSave(editablePrescription);
  };

  const hasAIClinicalData = editablePrescription.chiefComplaint;
  const medicinesCount = editablePrescription.medicines.length;

  // Format date for display
  const formattedDate = new Date(
    editablePrescription.createdAt
  ).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Navigation sections
  const sections = [
    {
      id: "patient",
      icon: User,
      title: "اطلاعات بیمار",
      description: "مشخصات فردی",
    },
    {
      id: "clinical",
      icon: Stethoscope,
      title: "معاینه بالینی",
      description: "تشخیص و علائم",
    },
    {
      id: "medicines",
      icon: Pill,
      title: "داروها",
      description: `${medicinesCount} دارو`,
    },
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col">
        {/* Header Card with Quick Info */}
        <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold">نسخه پزشکی</h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formattedDate}</span>
                    <Badge
                      variant="outline"
                      className="text-xs bg-primary/5 text-primary border-primary/20"
                    >
                      #{editablePrescription.id?.substring(0, 8) || "NEW"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                  className="flex items-center gap-2"
                >
                  <span className="hidden sm:inline">انصراف</span>
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span className="hidden sm:inline">در حال ذخیره</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span className="hidden sm:inline">ذخیره نسخه</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Navigation Bar - Fixed */}
        <Card className="sticky top-0 z-20 shadow-sm mt-4">
          <CardContent className="p-3">
            <div className="flex items-center justify-between overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  activeSection === section.id
                    ? "bg-primary text-primary-foreground border border-primary shadow-sm" // Fixed: Better contrast
                    : "text-muted hover:text-foreground hover:bg-muted/50 dark:hover:text-muted-foreground" // Fixed: Added dark mode hover
                }
              `}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="whitespace-nowrap">
                        {section.title}
                      </span>{" "}
                      {/* Added: Prevent text wrapping */}
                      {section.id === "clinical" && hasAIClinicalData && (
                        <Sparkles className="h-3 w-3 text-yellow-400 dark:text-yellow-300" /> // Improved: Better visibility
                      )}
                      {section.id === "medicines" && medicinesCount > 0 && (
                        <Badge
                          variant="secondary"
                          className={`
                    h-5 px-1.5 text-xs
                    ${
                      activeSection === section.id
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }
                  `}
                        >
                          {medicinesCount}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="text-xs text-muted-foreground hidden sm:block">
                کلیک کنید برای رفتن به هر بخش
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Form Content - No ScrollArea, Full Height */}
        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Section 1: Patient Information */}
          <Card id="patient" className="border-l-4 border-l-blue-500">
            <CardHeader className="bg-blue-50/50 dark:bg-blue-950/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">اطلاعات بیمار</CardTitle>
                  <CardDescription>مشخصات فردی و سوابق پزشکی</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-card border">
                  <div>
                    <Label
                      htmlFor="patientName"
                      className="text-sm font-medium"
                    >
                      نام کامل بیمار *
                    </Label>
                    <Input
                      id="patientName"
                      value={editablePrescription.patientName || ""}
                      onChange={(e) =>
                        updateField("patientName", e.target.value)
                      }
                      className="mt-1.5"
                      placeholder="نام و نام خانوادگی"
                    />
                  </div>
                  <div>
                    <Label htmlFor="patientAge" className="text-sm font-medium">
                      سن
                    </Label>
                    <Input
                      id="patientAge"
                      value={editablePrescription.patientAge || ""}
                      onChange={(e) =>
                        updateField("patientAge", e.target.value)
                      }
                      className="mt-1.5"
                      placeholder="مثال: 35 سال"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="patientGender"
                      className="text-sm font-medium"
                    >
                      جنسیت
                    </Label>
                    <Select
                      value={editablePrescription.patientGender || ""}
                      onValueChange={(value) =>
                        updateField("patientGender", value)
                      }
                    >
                      <SelectTrigger className="mt-1.5 text-foreground">
                        <SelectValue placeholder="انتخاب جنسیت" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="مرد" className="text-foreground">
                          مرد
                        </SelectItem>
                        <SelectItem value="زن" className="text-foreground">
                          زن
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label
                      htmlFor="patientPhone"
                      className="text-sm font-medium"
                    >
                      <Phone className="h-3 w-3 inline ml-1" />
                      شماره تماس
                    </Label>
                    <Input
                      id="patientPhone"
                      value={editablePrescription.patientPhone || ""}
                      onChange={(e) =>
                        updateField("patientPhone", e.target.value)
                      }
                      className="mt-1.5"
                      placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-card border">
                  <Label
                    htmlFor="allergies"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    آلرژی‌ها
                  </Label>
                  <Textarea
                    id="allergies"
                    value={editablePrescription.allergies?.join(", ") || ""}
                    onChange={(e) =>
                      updateField(
                        "allergies",
                        e.target.value
                          .split(",")
                          .map((a) => a.trim())
                          .filter((a) => a)
                      )
                    }
                    className="mt-1.5"
                    placeholder="مثال: پنی‌سیلین، آسپرین، بادام‌زمینی"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    آلرژی‌ها را با کاما جدا کنید
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-card border">
                  <Label
                    htmlFor="pastMedicalHistory"
                    className="text-sm font-medium"
                  >
                    سوابق پزشکی
                  </Label>
                  <Textarea
                    id="pastMedicalHistory"
                    value={editablePrescription.pastMedicalHistory || ""}
                    onChange={(e) =>
                      updateField("pastMedicalHistory", e.target.value)
                    }
                    className="mt-1.5"
                    placeholder="سوابق بیماری‌ها، جراحی‌ها، بستری‌ها"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Separator */}
          <div className="flex items-center justify-center">
            <div className="h-px w-32 bg-border"></div>
            <ChevronRight className="h-4 w-4 text-muted-foreground mx-2 rotate-180" />
            <div className="h-px w-32 bg-border"></div>
          </div>

          {/* Section 2: Clinical Information */}
          <Card id="clinical" className="border-l-4 border-l-green-500">
            <CardHeader className="bg-green-50/50 dark:bg-green-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Stethoscope className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">معاینه بالینی</CardTitle>
                    <CardDescription>
                      تشخیص، علائم حیاتی و اطلاعات پزشک
                    </CardDescription>
                  </div>
                </div>
                {hasAIClinicalData && (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    تکمیل شده با AI
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Chief Complaint & Diagnosis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-card border">
                  <div className="md:col-span-2">
                    <Label
                      htmlFor="chiefComplaint"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      شکایت اصلی
                      {editablePrescription.chiefComplaint && (
                        <Sparkles className="h-3 w-3 text-green-500" />
                      )}
                    </Label>
                    <Input
                      id="chiefComplaint"
                      value={editablePrescription.chiefComplaint || ""}
                      onChange={(e) =>
                        updateField("chiefComplaint", e.target.value)
                      }
                      className="mt-1.5"
                      placeholder="شکایت اصلی بیمار"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="diagnosis" className="text-sm font-medium">
                      تشخیص *
                    </Label>
                    <Input
                      id="diagnosis"
                      value={editablePrescription.diagnosis || ""}
                      onChange={(e) => updateField("diagnosis", e.target.value)}
                      className="mt-1.5"
                      placeholder="تشخیص بیماری"
                    />
                  </div>
                </div>

                {/* Vital Signs */}
                <div className="p-4 rounded-lg bg-card border">
                  <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    علائم حیاتی
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    <div>
                      <Label
                        htmlFor="pulseRate"
                        className="text-xs font-medium"
                      >
                        <Heart className="h-3 w-3 inline ml-1 text-rose-500" />
                        PR{" "}
                      </Label>
                      <Input
                        id="pulseRate"
                        value={editablePrescription.pulseRate || ""}
                        onChange={(e) =>
                          updateField("pulseRate", e.target.value)
                        }
                        className="mt-1.5 text-sm"
                        placeholder="۷۲"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="bloodPressure"
                        className="text-xs font-medium"
                      >
                        <Activity className="h-3 w-3 inline ml-1 text-blue-500" />
                        BP
                      </Label>
                      <Input
                        id="bloodPressure"
                        value={editablePrescription.bloodPressure || ""}
                        onChange={(e) =>
                          updateField("bloodPressure", e.target.value)
                        }
                        className="mt-1.5 text-sm"
                        placeholder="120.80"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="temperature"
                        className="text-xs font-medium"
                      >
                        <Thermometer className="h-3 w-3 inline ml-1 text-amber-500" />
                        Temp
                      </Label>
                      <Input
                        id="temperature"
                        value={editablePrescription.temperature || ""}
                        onChange={(e) =>
                          updateField("temperature", e.target.value)
                        }
                        className="mt-1.5 text-sm"
                        placeholder="36.8"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="respiratoryRate"
                        className="text-xs font-medium"
                      >
                        <Activity className="h-3 w-3 inline ml-1 text-green-500" />
                        RR
                      </Label>
                      <Input
                        id="respiratoryRate"
                        value={editablePrescription.respiratoryRate || ""}
                        onChange={(e) =>
                          updateField("respiratoryRate", e.target.value)
                        }
                        className="mt-1.5 text-sm"
                        placeholder="16"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="oxygenSaturation"
                        className="text-xs font-medium"
                      >
                        SpO₂
                      </Label>
                      <Input
                        id="oxygenSaturation"
                        value={editablePrescription.oxygenSaturation || ""}
                        onChange={(e) =>
                          updateField("oxygenSaturation", e.target.value)
                        }
                        className="mt-1.5 text-sm"
                        placeholder="98"
                      />
                    </div>
                  </div>
                </div>

                {/* Doctor and Clinic Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-card border">
                  <div>
                    <Label htmlFor="doctorName" className="text-sm font-medium">
                      نام پزشک
                    </Label>
                    <Input
                      id="doctorName"
                      value={editablePrescription.doctorName || ""}
                      onChange={(e) =>
                        updateField("doctorName", e.target.value)
                      }
                      className="mt-1.5"
                      placeholder="نام پزشک معالج"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clinicName" className="text-sm font-medium">
                      نام مرکز درمانی
                    </Label>
                    <Input
                      id="clinicName"
                      value={editablePrescription.clinicName || ""}
                      onChange={(e) =>
                        updateField("clinicName", e.target.value)
                      }
                      className="mt-1.5"
                      placeholder="نام کلینیک یا بیمارستان"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="doctorFree"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <DollarSign className="h-4 w-4" />
                      هزینه ویزیت
                    </Label>
                    <Input
                      id="doctorFree"
                      value={editablePrescription.doctorFree || ""}
                      onChange={(e) =>
                        updateField("doctorFree", e.target.value)
                      }
                      className="mt-1.5"
                      placeholder="مثال: ۵۰,۰۰۰ افغانی"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Separator */}
          <div className="flex items-center justify-center">
            <div className="h-px w-32 bg-border"></div>
            <ChevronRight className="h-4 w-4 text-muted-foreground mx-2 rotate-180" />
            <div className="h-px w-32 bg-border"></div>
          </div>

          {/* Section 3: Medicines */}
          <Card id="medicines" className="border-l-4 border-l-purple-500">
            <CardHeader className="bg-purple-50/50 dark:bg-purple-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Pill className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">داروها و تجویزات</CardTitle>
                    <CardDescription>
                      لیست داروهای تجویز شده و دستورات
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm">
                    {medicinesCount} دارو
                  </Badge>
                  <Button
                    onClick={addMedicine}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    افزودن دارو
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {medicinesCount > 0 && editablePrescription.diagnosis && (
                  <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-5 w-5 text-emerald-600" />
                      <div>
                        <h4 className="font-medium text-emerald-800">
                          داروهای پیشنهادی AI
                        </h4>
                        <p className="text-sm text-emerald-700">
                          داروهای پیشنهادی بر اساس تشخیص "
                          {editablePrescription.diagnosis}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead>
                        <tr className="bg-muted/50 border-b">
                          <th className="text-right p-3 text-sm font-medium">
                            نام دارو *
                          </th>
                          <th className="text-right p-3 text-sm font-medium">
                            دوز *
                          </th>
                          <th className="text-right p-3 text-sm font-medium">
                            فرم
                          </th>
                          <th className="text-right p-3 text-sm font-medium">
                            تعداد *
                          </th>
                          <th className="text-right p-3 text-sm font-medium">
                            مدت *
                          </th>
                          <th className="text-right p-3 text-sm font-medium">
                            راه مصرف
                          </th>
                          <th className="text-right p-3 text-sm font-medium">
                            توضیحات
                          </th>
                          <th className="text-right p-3 text-sm font-medium">
                            عملیات
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {editablePrescription.medicines.map(
                          (medicine, index) => (
                            <tr
                              key={medicine.id || index}
                              className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                            >
                              <td className="p-3">
                                <Input
                                  value={medicine.medicine || ""}
                                  onChange={(e) =>
                                    updateMedicine(
                                      index,
                                      "medicine",
                                      e.target.value
                                    )
                                  }
                                  placeholder="نام دارو"
                                  className="w-full text-sm text-foreground"
                                />
                              </td>
                              <td className="p-3">
                                <Input
                                  value={medicine.dosage || ""}
                                  onChange={(e) =>
                                    updateMedicine(
                                      index,
                                      "dosage",
                                      e.target.value
                                    )
                                  }
                                  placeholder="مثال: ۵۰۰ میلی‌گرم"
                                  className="w-full text-sm text-foreground"
                                />
                              </td>
                              <td className="p-3">
                                <Select
                                  value={medicine.form || "tablet"}
                                  onValueChange={(value) =>
                                    updateMedicine(index, "form", value)
                                  }
                                >
                                  <SelectTrigger className="w-full text-sm h-9 text-foreground data-[placeholder]:text-muted-foreground">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem
                                      value="tablet"
                                      className="text-foreground"
                                    >
                                      tablet
                                    </SelectItem>
                                    <SelectItem
                                      value="capsule"
                                      className="text-foreground"
                                    >
                                      capsule
                                    </SelectItem>
                                    <SelectItem
                                      value="syrup"
                                      className="text-foreground"
                                    >
                                      syrup
                                    </SelectItem>
                                    <SelectItem
                                      value="injection"
                                      className="text-foreground"
                                    >
                                      injection
                                    </SelectItem>
                                    <SelectItem
                                      value="drop"
                                      className="text-foreground"
                                    >
                                      drop
                                    </SelectItem>
                                    <SelectItem
                                      value="cream"
                                      className="text-foreground"
                                    >
                                      cream
                                    </SelectItem>
                                    <SelectItem
                                      value="ointment"
                                      className="text-foreground"
                                    >
                                      ointment
                                    </SelectItem>
                                    <SelectItem
                                      value="spray"
                                      className="text-foreground"
                                    >
                                      spray
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="p-3">
                                <Input
                                  value={medicine.frequency || ""}
                                  onChange={(e) =>
                                    updateMedicine(
                                      index,
                                      "frequency",
                                      e.target.value
                                    )
                                  }
                                  placeholder="مثال: هر ۸ ساعت"
                                  className="w-full text-sm text-foreground"
                                />
                              </td>
                              <td className="p-3">
                                <Input
                                  value={medicine.duration || ""}
                                  onChange={(e) =>
                                    updateMedicine(
                                      index,
                                      "duration",
                                      e.target.value
                                    )
                                  }
                                  placeholder="مثال: ۷ روز"
                                  className="w-full text-sm text-foreground"
                                />
                              </td>
                              <td className="p-3">
                                <Select
                                  value={medicine.route || "oral"}
                                  onValueChange={(value) =>
                                    updateMedicine(index, "route", value)
                                  }
                                >
                                  <SelectTrigger className="w-full text-sm h-9 text-foreground data-[placeholder]:text-muted-foreground">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem
                                      value="oral"
                                      className="text-foreground"
                                    >
                                      oral
                                    </SelectItem>
                                    <SelectItem
                                      value="topical"
                                      className="text-foreground"
                                    >
                                      topical
                                    </SelectItem>
                                    <SelectItem
                                      value="injection"
                                      className="text-foreground"
                                    >
                                      injection
                                    </SelectItem>
                                    <SelectItem
                                      value="nasal"
                                      className="text-foreground"
                                    >
                                      nasal
                                    </SelectItem>
                                    <SelectItem
                                      value="ophthalmic"
                                      className="text-foreground"
                                    >
                                      ophthalmic
                                    </SelectItem>
                                    <SelectItem
                                      value="otic"
                                      className="text-foreground"
                                    >
                                      otic
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="p-3">
                                <Input
                                  value={medicine.notes || ""}
                                  onChange={(e) =>
                                    updateMedicine(
                                      index,
                                      "notes",
                                      e.target.value
                                    )
                                  }
                                  placeholder="دستور مصرف"
                                  className="w-full text-sm text-foreground"
                                />
                              </td>
                              <td className="p-3">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => removeMedicine(index)}
                                      disabled={
                                        editablePrescription.medicines
                                          .length === 1
                                      }
                                      className="h-8 w-8 p-0"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>حذف دارو</TooltipContent>
                                </Tooltip>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Additional Instructions */}
                <div className="p-4 rounded-lg bg-card border">
                  <Label htmlFor="instructions" className="text-sm font-medium">
                    دستورات اضافی
                  </Label>
                  <Textarea
                    id="instructions"
                    value={editablePrescription.instructions || ""}
                    onChange={(e) =>
                      updateField("instructions", e.target.value)
                    }
                    className="mt-1.5"
                    placeholder="دستورات اضافی برای بیمار"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-card border">
                    <Label
                      htmlFor="followUp"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      زمان پیگیری
                    </Label>
                    <Input
                      id="followUp"
                      value={editablePrescription.followUp || ""}
                      onChange={(e) => updateField("followUp", e.target.value)}
                      className="mt-1.5"
                      placeholder="مثال: در صورت عدم بهبود پس از ۳ روز مراجعه شود"
                    />
                  </div>
                  <div className="p-4 rounded-lg bg-card border">
                    <Label
                      htmlFor="restrictions"
                      className="text-sm font-medium"
                    >
                      محدودیت‌ها
                    </Label>
                    <Input
                      id="restrictions"
                      value={editablePrescription.restrictions || ""}
                      onChange={(e) =>
                        updateField("restrictions", e.target.value)
                      }
                      className="mt-1.5"
                      placeholder="محدودیت‌های غذایی یا فعالیتی"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons Footer */}
        <Card className="mt-4 shadow-lg border-t">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      isSaving ? "bg-amber-500 animate-pulse" : "bg-green-500"
                    }`}
                  />
                  <span>{isSaving ? "در حال ذخیره..." : "آماده ذخیره"}</span>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                  <span>✓ بخش‌ها تکمیل شده:</span>
                  <span className="font-medium">
                    {
                      ["patientName", "diagnosis"].filter(
                        (field) =>
                          editablePrescription[field as keyof Prescription]
                      ).length
                    }
                    /2
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  انصراف
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ذخیره نسخه
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      ذخیره نسخه
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
