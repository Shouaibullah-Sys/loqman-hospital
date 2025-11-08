import { jsPDF } from "jspdf";
import { format } from "date-fns";
import "../vazirmatn-normal.js"; // Persian font (make sure it's loaded)
import { Prescription, Medicine } from "@/db/schema";

/** ✅ Draw Persian text safely (RTL direction) */
function drawPersianText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  align: "right" | "center" = "right"
) {
  doc.setFont("vazirmatn", "normal");
  doc.text(text, x, y, { align });
}

/** ✅ Format array data for display */
function formatArrayData(data: string[] | null): string {
  if (!data || !Array.isArray(data)) return "ندارد";
  return data.length > 0 ? data.join("، ") : "ندارد";
}

/** ✅ Format medical history data */
function formatMedicalHistory(prescription: Prescription): string {
  const parts = [];

  if (prescription.pastMedicalHistory) {
    parts.push(prescription.pastMedicalHistory);
  }

  if (prescription.familyHistory) {
    parts.push(`سابقه خانوادگی: ${prescription.familyHistory}`);
  }

  if (prescription.socialHistory) {
    parts.push(`سابقه اجتماعی: ${prescription.socialHistory}`);
  }

  return parts.length > 0 ? parts.join(" - ") : "ندارد";
}

/** ✅ Safe date formatting with null handling */
function formatDateSafe(
  date: Date | null | undefined,
  formatString: string
): string {
  if (!date) {
    return format(new Date(), formatString); // Fallback to current date
  }
  return format(date, formatString);
}

/** ✅ Generate comprehensive prescription PDF */
export async function generatePrescriptionPDF(
  prescription: Prescription & { medicines: Medicine[] }
): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 120;

  const primary: [number, number, number] = [42, 94, 168]; // Blue
  const accent: [number, number, number] = [66, 133, 244]; // Lighter blue
  const bgLight: [number, number, number] = [244, 247, 252]; // Very light blue
  const textDark: [number, number, number] = [40, 40, 40]; // Dark gray
  const success: [number, number, number] = [16, 185, 129]; // Green
  const warning: [number, number, number] = [245, 158, 11]; // Orange

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

  if (logo) {
    doc.addImage(logo, "PNG", 40, 15, 70, 70);
  }

  // Watermark
  (doc as any).setGState(new (doc as any).GState({ opacity: 0.07 }));
  if (logo) {
    doc.addImage(
      logo,
      "PNG",
      pageWidth / 2 - 150,
      pageHeight / 2 - 150,
      300,
      300
    );
  }
  (doc as any).setGState(new (doc as any).GState({ opacity: 1 }));

  // Titles
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("MEDICAL PRESCRIPTION", pageWidth / 2, 50, { align: "center" });
  drawPersianText(doc, "نسخه پزشکی", pageWidth / 2, 80, "center");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(230, 230, 230);

  // Use safe date formatting
  const displayDate =
    prescription.prescriptionDate || prescription.createdAt || new Date();

  if (prescription.prescriptionNumber) {
    doc.text(`Prescription No: ${prescription.prescriptionNumber}`, 40, 105);
  } else {
    doc.text(`Prescription ID: ${prescription.id}`, 40, 105);
  }

  doc.text(`Date: ${formatDateSafe(displayDate, "PPP")}`, pageWidth - 40, 105, {
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
    drawPersianText(doc, fa, pageWidth - 60, y, "right");
    y += 12;
  };

  const addSeparator = () => {
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    y += 8;
    doc.line(55, y, pageWidth - 55, y);
    y += 8;
  };

  const addField = (
    labelEn: string,
    value: string | null | undefined,
    labelFa: string
  ) => {
    if (!value) return;

    const formattedValue = value.toString().trim();
    if (!formattedValue) return;

    y += 14;

    // English version (left side)
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textDark);
    doc.setFontSize(9);
    doc.text(`${labelEn}:`, 60, y);
    doc.setFont("helvetica", "normal");
    doc.text(formattedValue, 60 + doc.getTextWidth(`${labelEn}: `), y);

    // Persian version (right side)
    doc.setFont("vazirmatn", "bold");
    drawPersianText(
      doc,
      `${labelFa}:`,
      pageWidth - 60 - doc.getTextWidth(formattedValue),
      y
    );
    doc.setFont("vazirmatn", "normal");
    drawPersianText(doc, formattedValue, pageWidth - 60, y);
  };

  // --- Patient Information ---
  drawSectionHeader("Patient Information", "معلومات بیمار");
  y += 8;

  addField("Name", prescription.patientName, "نام بیمار");
  addField("Age", prescription.patientAge, "سن");
  addField("Gender", prescription.patientGender, "جنسیت");
  addField("Phone", prescription.patientPhone, "شماره تماس");
  addField("Address", prescription.patientAddress, "آدرس");

  addSeparator();

  // --- Medical History ---
  drawSectionHeader("Medical History", "سوابق پزشکی");
  y += 8;

  addField("Allergies", formatArrayData(prescription.allergies), "حساسیت‌ها");
  addField(
    "Current Medications",
    formatArrayData(prescription.currentMedications),
    "داروهای فعلی"
  );
  addField(
    "Medical History",
    formatMedicalHistory(prescription),
    "سوابق پزشکی"
  );

  addSeparator();

  // --- Vital Signs ---
  drawSectionHeader("Vital Signs", "علائم حیاتی");
  y += 8;

  addField("Pulse Rate", prescription.pulseRate, "ضربان قلب");
  addField("Blood Pressure", prescription.bloodPressure, "فشار خون");
  addField("Temperature", prescription.temperature, "درجه حرارت");
  addField("Respiratory Rate", prescription.respiratoryRate, "میزان تنفس");
  addField("Oxygen Saturation", prescription.oxygenSaturation, "اشباع اکسیژن");

  addSeparator();

  // --- Medical Examination ---
  drawSectionHeader("Medical Examination", "معاینه پزشکی");
  y += 8;

  addField("Chief Complaint", prescription.chiefComplaint, "شکایت اصلی");
  addField(
    "History of Present Illness",
    prescription.historyOfPresentIllness,
    "تاریخچه بیماری فعلی"
  );
  addField(
    "Physical Examination",
    prescription.physicalExamination,
    "معاینه فیزیکی"
  );
  addField(
    "Differential Diagnosis",
    prescription.differentialDiagnosis,
    "تشخیص افتراقی"
  );

  addSeparator();

  // --- Diagnosis ---
  drawSectionHeader("Diagnosis", "تشخیص");
  y += 8;

  addField("Primary Diagnosis", prescription.diagnosis, "تشخیص اصلی");

  addSeparator();

  // --- Medications ---
  drawSectionHeader("Prescribed Medications", "داروهای تجویز شده");
  y += 8;

  doc.setFontSize(9);

  if (!prescription.medicines?.length) {
    y += 14;
    doc.setFont("helvetica", "italic");
    doc.setTextColor(150, 150, 150);
    doc.text("No medications prescribed.", 60, y);
    drawPersianText(doc, "هیچ دارویی تجویز نشده است.", pageWidth - 60, y);
    doc.setTextColor(...textDark);
  } else {
    // Table headers
    y += 20;
    doc.setFont("helvetica", "bold");
    doc.text("No.", 60, y);
    doc.text("Medicine", 90, y);
    doc.text("Dosage", 200, y);
    doc.text("Frequency", 280, y);
    doc.text("Duration", 360, y);
    doc.text("Instructions", 440, y);

    drawPersianText(doc, "شماره", pageWidth - 60, y);
    drawPersianText(doc, "دارو", pageWidth - 90, y);
    drawPersianText(doc, "دوز", pageWidth - 200, y);
    drawPersianText(doc, "تکرار", pageWidth - 280, y);
    drawPersianText(doc, "مدت", pageWidth - 360, y);
    drawPersianText(doc, "دستورات", pageWidth - 440, y);

    y += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(55, y, pageWidth - 55, y);
    y += 10;

    // Medicine rows
    doc.setFont("helvetica", "normal");
    for (const [index, medicine] of prescription.medicines.entries()) {
      if (y > pageHeight - 150) {
        doc.addPage();
        y = 80;

        // Redraw headers on new page
        y += 20;
        doc.setFont("helvetica", "bold");
        doc.text("No.", 60, y);
        doc.text("Medicine", 90, y);
        doc.text("Dosage", 200, y);
        doc.text("Frequency", 280, y);
        doc.text("Duration", 360, y);
        doc.text("Instructions", 440, y);

        y += 5;
        doc.line(55, y, pageWidth - 55, y);
        y += 10;
      }

      y += 16;
      doc.text(`${index + 1}.`, 60, y);
      doc.text(medicine.medicine || "", 90, y);
      doc.text(medicine.dosage || "", 200, y);
      doc.text(medicine.frequency || "", 280, y);
      doc.text(medicine.duration || "", 360, y);

      // Handle long instructions
      const instructions = medicine.instructions || "";
      if (instructions.length > 20) {
        doc.text(instructions.substring(0, 20) + "...", 440, y);
      } else {
        doc.text(instructions, 440, y);
      }

      // Additional medicine details if space allows
      if (medicine.route || medicine.timing || medicine.notes) {
        y += 12;
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);

        const details = [];
        if (medicine.route) details.push(`Route: ${medicine.route}`);
        if (medicine.timing) details.push(`Timing: ${medicine.timing}`);
        if (medicine.withFood) details.push("With Food");
        if (medicine.notes) details.push(`Notes: ${medicine.notes}`);

        if (details.length > 0) {
          doc.text(details.join(" | "), 90, y);
        }

        doc.setFontSize(9);
        doc.setTextColor(...textDark);
      }
    }
  }

  addSeparator();

  // --- Treatment Instructions ---
  drawSectionHeader("Treatment Instructions", "دستورات درمانی");
  y += 8;

  addField("Instructions", prescription.instructions, "دستورات");
  addField("Follow-up", prescription.followUp, "پیگیری");
  addField("Restrictions", prescription.restrictions, "محدودیت‌ها");

  addSeparator();

  // --- Doctor Information ---
  drawSectionHeader("Medical Practitioner", "اطلاعات پزشک");
  y += 20;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primary);
  doc.setFontSize(12);
  doc.text(prescription.doctorName || "Dr. Unknown", 60, y);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textDark);
  doc.setFontSize(10);

  if (prescription.doctorLicenseNumber) {
    doc.text(`License: ${prescription.doctorLicenseNumber}`, 60, y + 14);
  }

  if (prescription.clinicName) {
    doc.text(`Clinic: ${prescription.clinicName}`, 60, y + 28);
  }

  if (prescription.clinicAddress) {
    doc.text(`Address: ${prescription.clinicAddress}`, 60, y + 42);
  }

  // Persian version
  drawPersianText(doc, prescription.doctorName || "دکتر", pageWidth - 60, y);

  if (prescription.doctorLicenseNumber) {
    drawPersianText(
      doc,
      `شماره پروانه: ${prescription.doctorLicenseNumber}`,
      pageWidth - 60,
      y + 14
    );
  }

  if (prescription.clinicName) {
    drawPersianText(
      doc,
      `مطب: ${prescription.clinicName}`,
      pageWidth - 60,
      y + 28
    );
  }

  if (prescription.clinicAddress) {
    drawPersianText(
      doc,
      `آدرس: ${prescription.clinicAddress}`,
      pageWidth - 60,
      y + 42
    );
  }

  // Signature area
  y += 70;
  doc.setDrawColor(90, 90, 90);
  doc.setLineWidth(1);
  doc.line(60, y, 220, y);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text("Signature & Stamp", 60, y + 10);
  drawPersianText(doc, "امضاء و مهر", pageWidth - 60, y + 10);

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
  drawPersianText(
    doc,
    "این نسخه توسط سیستم تولید شده و نیاز به امضاء فیزیکی ندارد.",
    pageWidth / 2,
    footerY + 12,
    "center"
  );

  // Save with safe date handling
  const safeName = prescription.patientName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");

  const fileName = `prescription-${safeName}-${formatDateSafe(
    displayDate,
    "yyyy-MM-dd"
  )}.pdf`;

  doc.save(fileName);
}

/** Backward compatible wrapper */
export const downloadPrescriptionPDF = generatePrescriptionPDF;

/** Legacy support for old prescription format */
export async function downloadPrescriptionPDFLegacy(
  prescription: any
): Promise<void> {
  // Adapt legacy prescription format to new format if needed
  return generatePrescriptionPDF(prescription);
}
