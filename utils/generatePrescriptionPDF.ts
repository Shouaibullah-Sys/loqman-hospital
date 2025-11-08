import { jsPDF } from "jspdf";
import { format } from "date-fns";
import "../vazirmatn-normal.js"; // Persian font (make sure it's loaded)
import { Prescription, FormMedicine } from "@/types/prescription";

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface VoicePrescription {
  _id: string;
  patientName: string;
  patientAge: string;
  patientGender: string;
  allergies: string[];
  pulseRate: string;
  medicationUsage: string;
  relevantPastMedicalHistory: string;
  diagnosis: string;
  medications: Medication[];
  instructions: string;
  doctorName: string;
  date: string;
  transcription?: string;
  source: string;
  status: string;
}

/** ✅ Convert normal Prescription to VoicePrescription-like structure */
function adaptPrescriptionToVoicePrescription(
  prescription: Prescription
): VoicePrescription {
  const medications: Medication[] =
    prescription.prescription?.map((med: FormMedicine) => ({
      name: med.medicine,
      dosage: med.dosage,
      frequency: med.frequency,
      duration: med.duration,
      instructions: med.instructions || "",
    })) || [];

  const allergies = Array.isArray(prescription.allergies)
    ? prescription.allergies
    : [];

  const currentMedications = Array.isArray(prescription.currentMedications)
    ? prescription.currentMedications
    : [];

  return {
    _id: prescription.id,
    patientName: prescription.patientName,
    patientAge: prescription.patientAge || "",
    patientGender: prescription.patientGender || "",
    allergies,
    pulseRate: prescription.pulseRate || "",
    medicationUsage: currentMedications.join(", "),
    relevantPastMedicalHistory: prescription.pastMedicalHistory || "",
    diagnosis: prescription.diagnosis,
    medications,
    instructions: prescription.instructions || "",
    doctorName: prescription.doctorName || "",
    date: prescription.prescriptionDate.toString(),
    transcription: prescription.rawAiResponse || "",
    source: prescription.source || "",
    status: prescription.status || "",
  };
}

/** ✅ Draw Dari text safely (RTL direction) */
function drawDariText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  align: "right" | "center" = "right"
) {
  doc.setFont("vazirmatn", "normal");
  doc.text(text, x, y, { align });
}

/** ✅ Generate bilingual PDF (English + Dari) */
export async function generatePrescriptionPDF(
  prescription: VoicePrescription
): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 120;

  const primary: [number, number, number] = [42, 94, 168];
  const accent: [number, number, number] = [66, 133, 244];
  const bgLight: [number, number, number] = [244, 247, 252];
  const textDark: [number, number, number] = [40, 40, 40];

  // Logo (optional)
  let logo = "";
  try {
    const response = await fetch("/logo.png");
    const blob = await response.blob();
    logo = await new Promise<string>((res) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch {}

  // Header
  doc.setFillColor(...primary);
  doc.rect(0, 0, pageWidth, 120, "F");
  doc.setDrawColor(...accent);
  doc.setLineWidth(3);
  doc.line(0, 120, pageWidth, 120);
  if (logo) doc.addImage(logo, "PNG", 40, 15, 70, 70);

  // Watermark
  (doc as any).setGState(new (doc as any).GState({ opacity: 0.07 }));
  if (logo)
    doc.addImage(
      logo,
      "PNG",
      pageWidth / 2 - 150,
      pageHeight / 2 - 150,
      300,
      300
    );
  (doc as any).setGState(new (doc as any).GState({ opacity: 1 }));

  // Titles
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("MEDICAL PRESCRIPTION", pageWidth / 2, 50, { align: "center" });
  drawDariText(doc, "نسخهٔ طبی (سند رسمی)", pageWidth / 2, 80, "center");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(230, 230, 230);
  doc.text(`Prescription ID: ${prescription._id}`, 40, 105);
  doc.text(`Date: ${format(new Date(), "PPP")}`, pageWidth - 40, 105, {
    align: "right",
  });

  // === Helper functions ===
  const drawSectionHeader = (en: string, fa: string) => {
    y += 25;
    doc.setFillColor(...accent);
    doc.rect(40, y - 16, 6, 24, "F");
    doc.setFillColor(...bgLight);
    doc.roundedRect(40, y - 16, pageWidth - 80, 24, 6, 6, "FD");
    doc.setTextColor(...primary);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(en, 60, y);
    drawDariText(doc, fa, pageWidth - 60, y, "right");
    y += 12;
  };

  const addSeparator = () => {
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    y += 8;
    doc.line(55, y, pageWidth - 55, y);
    y += 8;
  };

  // --- Patient Info ---
  drawSectionHeader("Patient Information", "معلومات مریض");
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textDark);
  doc.setFontSize(10);
  doc.text(`Name: ${prescription.patientName}`, 60, y);
  doc.text(
    `Age & Gender: ${prescription.patientAge}, ${prescription.patientGender}`,
    60,
    (y += 14)
  );
  doc.text(`Diagnosis: ${prescription.diagnosis}`, 60, (y += 14));
  doc.text(`Status: ${prescription.status}`, 60, (y += 14));
  drawDariText(
    doc,
    `نام مریض: ${prescription.patientName}`,
    pageWidth - 60,
    y - 28
  );
  drawDariText(
    doc,
    `عمر و جنسیت: ${prescription.patientAge}، ${prescription.patientGender}`,
    pageWidth - 60,
    y - 14
  );
  drawDariText(doc, `تشخیص: ${prescription.diagnosis}`, pageWidth - 60, y);
  addSeparator();

  // --- Medical History ---
  drawSectionHeader("Medical History", "سابقهٔ طبی");
  y += 8;
  const allergies =
    prescription.allergies?.length > 0
      ? prescription.allergies.join(", ")
      : "None";
  doc.text(`Allergies: ${allergies}`, 60, y);
  doc.text(`Medication Use: ${prescription.medicationUsage}`, 60, (y += 14));
  doc.text(
    `Past History: ${prescription.relevantPastMedicalHistory}`,
    60,
    (y += 14)
  );
  addSeparator();

  // --- Medications ---
  drawSectionHeader("Prescribed Medications", "دواهای تجویز شده");
  y += 8;
  doc.setFontSize(9);
  if (!prescription.medications?.length) {
    doc.text("No medications prescribed.", 60, (y += 14));
    drawDariText(doc, "هیچ دوا تجویز نگردیده است.", pageWidth - 60, y);
  } else {
    for (const [i, m] of prescription.medications.entries()) {
      y += 20;
      if (y > pageHeight - 150) {
        doc.addPage();
        y = 80;
      }
      doc.setFont("helvetica", "bold");
      doc.text(`${i + 1}. ${m.name}`, 60, y);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Dosage: ${m.dosage}  |  Frequency: ${m.frequency}  |  Duration: ${m.duration}`,
        60,
        (y += 12)
      );
      doc.text(`Instructions: ${m.instructions}`, 60, (y += 12));
    }
  }
  addSeparator();

  // --- Additional Instructions ---
  if (prescription.instructions) {
    drawSectionHeader("Additional Instructions", "دساتیر اضافی");
    y += 10;
    doc.text(prescription.instructions, 60, y);
    addSeparator();
  }

  // --- Doctor Info ---
  drawSectionHeader("Medical Practitioner", "داکتر معالج");
  y += 20;
  doc.setFont("helvetica", "bold");
  doc.text(prescription.doctorName, 60, y);
  doc.setFont("helvetica", "normal");
  doc.text("Medical Practitioner", 60, (y += 12));
  drawDariText(doc, prescription.doctorName, pageWidth - 60, y - 12);
  drawDariText(doc, "داکتر معالج", pageWidth - 60, y);

  // Signature
  y += 40;
  doc.setDrawColor(90, 90, 90);
  doc.line(60, y, 220, y);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text("Signature & Stamp", 60, y + 10);

  // Footer
  const footerY = pageHeight - 45;
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  doc.text(
    "This is a computer-generated prescription. No physical signature required.",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );
  drawDariText(
    doc,
    "این نسخه توسط سیستم تولید شده و نیاز به امضاء فزیکی ندارد.",
    pageWidth / 2,
    footerY + 12,
    "center"
  );

  // Save
  const safeName = prescription.patientName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
  const fileName = `prescription-${safeName}-${format(
    new Date(prescription.date),
    "yyyy-MM-dd"
  )}.pdf`;
  doc.save(fileName);
}

/** Backward compatible wrapper */
export const downloadPrescriptionPDF = generatePrescriptionPDF;

export async function downloadPrescriptionPDFLegacy(
  prescription: Prescription
): Promise<void> {
  const voicePrescription = adaptPrescriptionToVoicePrescription(prescription);
  return generatePrescriptionPDF(voicePrescription);
}
