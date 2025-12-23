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
} from "lucide-react";
import { Prescription, FormMedicine } from "@/types/prescription";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  const [activeSection, setActiveSection] = useState<string>("clinical");

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
      doctorName: prescription.doctorName || "دکتر احمدی",
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

  return (
    <TooltipProvider>
      <div className="space-y-6">
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

        {/* Main Tabs - Fixed with clinic theme */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-0">
            <Tabs
              value={activeSection}
              onValueChange={setActiveSection}
              className="w-full"
            >
              <TabsList className="w-full justify-start h-auto p-0 border-b bg-transparent overflow-x-auto flex-nowrap scrollbar-hide">
                <TabsTrigger
                  value="patient"
                  className="
                    relative 
                    data-[state=active]:text-primary 
                    data-[state=active]:border-b-2 
                    data-[state=active]:border-primary 
                    data-[state=active]:bg-primary/5
                    rounded-none 
                    px-3 sm:px-4 md:px-6 
                    py-3 sm:py-4
                    h-auto 
                    text-xs sm:text-sm
                    flex-shrink-0
                    flex items-center gap-1 sm:gap-2
                    text-muted-foreground 
                    data-[state=active]:text-primary
                    dark:text-gray-300
                    dark:data-[state=active]:text-primary
                    dark:data-[state=active]:bg-primary/10
                    transition-colors duration-200
                    hover:text-foreground dark:hover:text-white
                  "
                >
                  <User className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                  <div className="text-right">
                    <div className="font-medium sm:font-semibold">
                      اطلاعات بیمار
                    </div>
                    <div className="hidden xs:block text-[10px] sm:text-xs text-muted-foreground dark:text-gray-400">
                      مشخصات فردی
                    </div>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="clinical"
                  className="
                    relative 
                    data-[state=active]:text-primary 
                    data-[state=active]:border-b-2 
                    data-[state=active]:border-primary 
                    data-[state=active]:bg-primary/5
                    rounded-none 
                    px-3 sm:px-4 md:px-6 
                    py-3 sm:py-4
                    h-auto 
                    text-xs sm:text-sm
                    flex-shrink-0
                    flex items-center gap-1 sm:gap-2
                    text-muted-foreground 
                    data-[state=active]:text-primary
                    dark:text-gray-300
                    dark:data-[state=active]:text-primary
                    dark:data-[state=active]:bg-primary/10
                    transition-colors duration-200
                    hover:text-foreground dark:hover:text-white
                  "
                >
                  <Stethoscope className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                  <div className="text-right">
                    <div className="font-medium sm:font-semibold">
                      معاینه بالینی
                    </div>
                    <div className="hidden xs:block text-[10px] sm:text-xs text-muted-foreground dark:text-gray-400">
                      {hasAIClinicalData && (
                        <div className="flex items-center gap-1">
                          <Sparkles className="h-2 w-2 sm:h-3 sm:w-3 text-green-500" />
                          AI Generated
                        </div>
                      )}
                    </div>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="medicines"
                  className="
                    relative 
                    data-[state=active]:text-primary 
                    data-[state=active]:border-b-2 
                    data-[state=active]:border-primary 
                    data-[state=active]:bg-primary/5
                    rounded-none 
                    px-3 sm:px-4 md:px-6 
                    py-3 sm:py-4
                    h-auto 
                    text-xs sm:text-sm
                    flex-shrink-0
                    flex items-center gap-1 sm:gap-2
                    text-muted-foreground 
                    data-[state=active]:text-primary
                    dark:text-gray-300
                    dark:data-[state=active]:text-primary
                    dark:data-[state=active]:bg-primary/10
                    transition-colors duration-200
                    hover:text-foreground dark:hover:text-white
                  "
                >
                  <Pill className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                  <div className="text-right">
                    <div className="font-medium sm:font-semibold">داروها</div>
                    <div className="hidden xs:block text-[10px] sm:text-xs text-muted-foreground dark:text-gray-400">
                      {medicinesCount} دارو
                      {medicinesCount > 0 && (
                        <Sparkles className="inline h-2 w-2 sm:h-3 sm:w-3 text-green-500 mr-1" />
                      )}
                    </div>
                  </div>
                </TabsTrigger>
              </TabsList>

              {/* Patient Information Tab */}
              <TabsContent value="patient" className="p-4 sm:p-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-6">
                    <User className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">مشخصات بیمار</h3>
                  </div>

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
                      <Label
                        htmlFor="patientAge"
                        className="text-sm font-medium"
                      >
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
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="انتخاب جنسیت" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="مرد">مرد</SelectItem>
                          <SelectItem value="زن">زن</SelectItem>
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
              </TabsContent>

              {/* Clinical Information Tab */}
              <TabsContent value="clinical" className="p-4 sm:p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">معاینه بالینی</h3>
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

                  <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <Brain className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-blue-800">
                          اطلاعات بالینی
                        </h4>
                        <p className="text-sm text-blue-700">
                          شکایت اصلی و علائم بیمار را برای معاینه دقیق وارد
                          کنید.
                        </p>
                      </div>
                    </div>
                  </div>

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
                      <Label
                        htmlFor="diagnosis"
                        className="text-sm font-medium"
                      >
                        تشخیص *
                      </Label>
                      <Input
                        id="diagnosis"
                        value={editablePrescription.diagnosis || ""}
                        onChange={(e) =>
                          updateField("diagnosis", e.target.value)
                        }
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
                          نبض
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
                          فشار خون
                        </Label>
                        <Input
                          id="bloodPressure"
                          value={editablePrescription.bloodPressure || ""}
                          onChange={(e) =>
                            updateField("bloodPressure", e.target.value)
                          }
                          className="mt-1.5 text-sm"
                          placeholder="۱۲۰/۸۰"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="temperature"
                          className="text-xs font-medium"
                        >
                          <Thermometer className="h-3 w-3 inline ml-1 text-amber-500" />
                          دما
                        </Label>
                        <Input
                          id="temperature"
                          value={editablePrescription.temperature || ""}
                          onChange={(e) =>
                            updateField("temperature", e.target.value)
                          }
                          className="mt-1.5 text-sm"
                          placeholder="۳۶.۸"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="respiratoryRate"
                          className="text-xs font-medium"
                        >
                          تنفس
                        </Label>
                        <Input
                          id="respiratoryRate"
                          value={editablePrescription.respiratoryRate || ""}
                          onChange={(e) =>
                            updateField("respiratoryRate", e.target.value)
                          }
                          className="mt-1.5 text-sm"
                          placeholder="۱۶"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="oxygenSaturation"
                          className="text-xs font-medium"
                        >
                          SPO2
                        </Label>
                        <Input
                          id="oxygenSaturation"
                          value={editablePrescription.oxygenSaturation || ""}
                          onChange={(e) =>
                            updateField("oxygenSaturation", e.target.value)
                          }
                          className="mt-1.5 text-sm"
                          placeholder="۹۸"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Doctor and Clinic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-card border">
                    <div>
                      <Label
                        htmlFor="doctorName"
                        className="text-sm font-medium"
                      >
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
                      <Label
                        htmlFor="clinicName"
                        className="text-sm font-medium"
                      >
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
              </TabsContent>

              {/* Medicines Tab */}
              <TabsContent value="medicines" className="p-4 sm:p-6">
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <Pill className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="text-lg font-semibold">
                          داروها و تجویزات
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          لیست داروهای تجویز شده
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={addMedicine}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      افزودن دارو
                    </Button>
                  </div>

                  {medicinesCount > 0 && (
                    <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-lg p-4 mb-6">
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
                              تناوب *
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
                                    className="w-full text-sm"
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
                                    className="w-full text-sm"
                                  />
                                </td>
                                <td className="p-3">
                                  <Select
                                    value={medicine.form || "tablet"}
                                    onValueChange={(value) =>
                                      updateMedicine(index, "form", value)
                                    }
                                  >
                                    <SelectTrigger className="w-full text-sm h-9">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="tablet">
                                        قرص
                                      </SelectItem>
                                      <SelectItem value="capsule">
                                        کپسول
                                      </SelectItem>
                                      <SelectItem value="syrup">
                                        شربت
                                      </SelectItem>
                                      <SelectItem value="injection">
                                        آمپول
                                      </SelectItem>
                                      <SelectItem value="drop">قطره</SelectItem>
                                      <SelectItem value="cream">کرم</SelectItem>
                                      <SelectItem value="ointment">
                                        پماد
                                      </SelectItem>
                                      <SelectItem value="spray">
                                        اسپری
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
                                    className="w-full text-sm"
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
                                    className="w-full text-sm"
                                  />
                                </td>
                                <td className="p-3">
                                  <Select
                                    value={medicine.route || "oral"}
                                    onValueChange={(value) =>
                                      updateMedicine(index, "route", value)
                                    }
                                  >
                                    <SelectTrigger className="w-full text-sm h-9">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="oral">
                                        دهانی
                                      </SelectItem>
                                      <SelectItem value="topical">
                                        موضعی
                                      </SelectItem>
                                      <SelectItem value="injection">
                                        تزریقی
                                      </SelectItem>
                                      <SelectItem value="nasal">
                                        بینی
                                      </SelectItem>
                                      <SelectItem value="ophthalmic">
                                        چشمی
                                      </SelectItem>
                                      <SelectItem value="otic">گوشی</SelectItem>
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
                                    className="w-full text-sm"
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
                    <Label
                      htmlFor="instructions"
                      className="text-sm font-medium"
                    >
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
                        onChange={(e) =>
                          updateField("followUp", e.target.value)
                        }
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
              </TabsContent>
            </Tabs>

            {/* Action Buttons Footer */}
            <CardFooter className="border-t p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      isSaving ? "bg-amber-500 animate-pulse" : "bg-green-500"
                    }`}
                  />
                  <span>{isSaving ? "در حال ذخیره..." : "آماده ذخیره"}</span>
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
            </CardFooter>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
