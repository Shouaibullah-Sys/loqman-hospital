//utils/generatePrescriptionPDF.ts

import { jsPDF } from "jspdf";
import { format } from "date-fns";
import "../vazirmatn-normal.js";
import { Prescription, Medicine } from "@/db/schema";

/** ✅ Enhanced Color Palette for Medical Theme */
const Colors = {
  // Primary Medical Colors
  primary: [41, 128, 185] as [number, number, number], // Professional Blue
  secondary: [52, 152, 219] as [number, number, number], // Light Blue
  accent: [46, 204, 113] as [number, number, number], // Medical Green
  warning: [230, 126, 34] as [number, number, number], // Orange
  danger: [231, 76, 60] as [number, number, number], // Red
  success: [46, 204, 113] as [number, number, number], // Green

  // Neutral Tones
  dark: [44, 62, 80] as [number, number, number], // Dark Blue-Gray
  medium: [127, 140, 141] as [number, number, number], // Medium Gray
  light: [236, 240, 241] as [number, number, number], // Light Gray
  white: [255, 255, 255] as [number, number, number], // Pure White

  // Medical Specific
  prescription: [155, 89, 182] as [number, number, number], // Purple for prescriptions
  header: [41, 128, 185] as [number, number, number], // Header Blue
  watermark: [248, 249, 250] as [number, number, number], // Very Light Background
  border: [189, 195, 199] as [number, number, number], // Border Gray
  cardBg: [248, 250, 252] as [number, number, number], // Card Background
} as const;

/** ✅ Helper to convert color array to individual values */
function setColor(doc: jsPDF, color: [number, number, number]) {
  const [r, g, b] = color;
  return { r, g, b };
}

/** ✅ Draw Persian text safely (RTL) */
function drawPersianText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  align: "right" | "center" | "left" = "right",
  fontSize: number = 10,
  color: [number, number, number] = Colors.dark
) {
  doc.setFont("vazirmatn", "normal");
  doc.setFontSize(fontSize);
  const { r, g, b } = setColor(doc, color);
  doc.setTextColor(r, g, b);
  doc.text(text, x, y, { align });
}

/** ✅ Draw English text (LTR) */
function drawEnglishText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  align: "left" | "center" | "right" = "left",
  fontSize: number = 10,
  color: [number, number, number] = Colors.dark
) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);
  const { r, g, b } = setColor(doc, color);
  doc.setTextColor(r, g, b);
  doc.text(text, x, y, { align });
}

/** ✅ Draw text with custom font and styling */
function drawText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  options: {
    align?: "left" | "center" | "right";
    fontSize?: number;
    color?: [number, number, number];
    font?: "vazirmatn" | "helvetica";
    style?: "normal" | "bold" | "italic";
  } = {}
) {
  const {
    align = "left",
    fontSize = 10,
    color = Colors.dark,
    font = "vazirmatn",
    style = "normal",
  } = options;

  doc.setFont(font, style);
  doc.setFontSize(fontSize);
  const { r, g, b } = setColor(doc, color);
  doc.setTextColor(r, g, b);
  doc.text(text, x, y, { align });
}

/** ✅ Combine bilingual text line */
function drawBilingualLine(
  doc: jsPDF,
  xLeft: number,
  xRight: number,
  y: number,
  enText?: string,
  faText?: string,
  fontSize: number = 10
) {
  if (enText) drawEnglishText(doc, enText, xLeft, y, "left", fontSize);
  if (faText) drawPersianText(doc, faText, xRight, y, "right", fontSize);
}

/** ✅ Format helpers */
function formatArrayData(data: string[] | null): string {
  if (!data || !Array.isArray(data)) return "ثبت نشده";
  return data.length > 0 ? data.join("، ") : "ثبت نشده";
}

function formatDateSafe(
  date: Date | null | undefined,
  formatString: string
): string {
  return format(date || new Date(), formatString);
}

/** ✅ Add watermark background with medical theme */
function addWatermark(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Very light background
  const { r, g, b } = setColor(doc, Colors.watermark);
  doc.setFillColor(r, g, b);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Subtle medical pattern watermark
  const patternColor = [245, 246, 250] as [number, number, number];
  const { r: pr, g: pg, b: pb } = setColor(doc, patternColor);
  doc.setTextColor(pr, pg, pb);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  // Add subtle pattern text
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 4; j++) {
      const x = (pageWidth / 4) * j + 50;
      const y = (pageHeight / 3) * i + 200;
      doc.text("Dr. Sebghat Medical Center", x, y, {
        align: "center",
        angle: 15,
      });
    }
  }

  // Reset text color
  const { r: dr, g: dg, b: db } = setColor(doc, Colors.dark);
  doc.setTextColor(dr, dg, db);
}

/** ✅ Create enhanced header with logo integration */
async function createHeader(doc: jsPDF, prescription: Prescription) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const headerHeight = 100;

  // Header background with gradient effect
  const { r: pr, g: pg, b: pb } = setColor(doc, Colors.primary);
  doc.setFillColor(pr, pg, pb);
  doc.rect(0, 0, pageWidth, headerHeight, "F");

  // Subtle gradient bottom border
  const { r: sr, g: sg, b: sb } = setColor(doc, Colors.secondary);
  doc.setFillColor(sr, sg, sb);
  doc.rect(0, headerHeight - 8, pageWidth, 8, "F");

  // Logo integration
  const logoSize = 45;
  const logoX = 25;
  const logoY = (headerHeight - logoSize) / 2;

  try {
    // Try to add the actual logo image
    const logoPath = "public/logo.png";
    // Note: In a real environment, you'd use fs.readFileSync to load the image
    // For now, we'll create a stylized logo placeholder
  } catch (error) {
    // Fallback to stylized logo design
    // Logo background circle
    const { r: wr, g: wg, b: wb } = setColor(doc, Colors.white);
    doc.setFillColor(wr, wg, wb);
    doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, "F");

    // Medical cross symbol
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    const { r: cr, g: cg, b: cb } = setColor(doc, Colors.primary);
    doc.setTextColor(cr, cg, cb);
    doc.text("+", logoX + logoSize / 2, logoY + logoSize / 2 + 8, {
      align: "center",
    });
  }

  // Title and subtitle
  const titleX = logoX + logoSize + 25;
  const titleY = headerHeight / 2 - 15;

  drawEnglishText(
    doc,
    "MEDICAL PRESCRIPTION",
    titleX,
    titleY,
    "left",
    18,
    Colors.white
  );
  drawPersianText(
    doc,
    "نسخه پزشکی",
    titleX,
    titleY + 20,
    "left",
    16,
    Colors.white
  );
  drawPersianText(
    doc,
    "مرکز درمانی دکتر سبغت",
    titleX,
    titleY + 35,
    "left",
    12,
    Colors.white
  );

  // Prescription ID and date on the right
  const rightX = pageWidth - 25;
  const prescriptionId = prescription.id.slice(0, 8).toUpperCase();

  drawEnglishText(
    doc,
    `RX ID: ${prescriptionId}`,
    rightX,
    titleY,
    "right",
    11,
    Colors.white
  );
  drawEnglishText(
    doc,
    formatDateSafe(prescription.prescriptionDate, "PPP"),
    rightX,
    titleY + 15,
    "right",
    9,
    Colors.white
  );
  drawEnglishText(
    doc,
    `Created: ${formatDateSafe(prescription.createdAt, "PPp")}`,
    rightX,
    titleY + 25,
    "right",
    8,
    Colors.white
  );
}

/** ✅ Enhanced section headers with medical styling */
function drawSectionHeader(
  doc: jsPDF,
  y: number,
  en: string,
  fa: string
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const sectionHeight = 28;

  // Section background with medical color
  const { r: sr, g: sg, b: sb } = setColor(doc, Colors.secondary);
  doc.setFillColor(sr, sg, sb);
  doc.roundedRect(20, y, pageWidth - 40, sectionHeight, 6, 6, "F");

  // Section border
  const { r: br, g: bg, b: bb } = setColor(doc, Colors.border);
  doc.setDrawColor(br, bg, bb);
  doc.setLineWidth(0.8);
  doc.roundedRect(20, y, pageWidth - 40, sectionHeight, 6, 6, "S");

  // Medical icon
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  const [wr, wg, wb] = Colors.white;
  doc.setTextColor(wr, wg, wb);
  doc.text("⚕", 30, y + 18);

  // Section text
  drawBilingualLine(doc, 50, pageWidth - 50, y + 18, en, fa, 12);

  return y + sectionHeight + 12;
}

/** ✅ Enhanced field display with better medical styling */
function addBilingualField(
  doc: jsPDF,
  y: number,
  enLabel: string,
  value: string | null,
  faLabel: string
): number {
  if (!value || value.trim() === "") return y;

  const pageWidth = doc.internal.pageSize.getWidth();
  const leftMargin = 50;
  const rightMargin = 50;

  // Label styling with medical colors
  drawEnglishText(doc, enLabel + ":", leftMargin, y, "left", 10, Colors.medium);
  drawPersianText(
    doc,
    faLabel + ":",
    pageWidth - rightMargin,
    y,
    "right",
    10,
    Colors.medium
  );

  // Value styling
  const valueY = y + 18;
  const fontSize = 11;

  // Check if value is long and needs wrapping
  const maxWidth = pageWidth - leftMargin - rightMargin - 100;
  if (doc.getTextWidth(value) > maxWidth) {
    // Multi-line text with better spacing
    const lines = doc.splitTextToSize(value, maxWidth);
    lines.forEach((line: string, index: number) => {
      drawText(doc, line, leftMargin + 60, valueY + index * 14, {
        fontSize: 10,
        color: Colors.dark,
        font: "vazirmatn",
      });
    });
    return valueY + lines.length * 14 + 8;
  } else {
    // Single line text
    drawText(doc, value, leftMargin + 60, valueY, {
      fontSize,
      color: Colors.dark,
      font: "vazirmatn",
    });
    return valueY + 18;
  }
}

/** ✅ Enhanced medicine display with professional medical card design */
function addMedicineSection(
  doc: jsPDF,
  y: number,
  medicines: Medicine[]
): number {
  const pageWidth = doc.internal.pageSize.getWidth();

  if (!medicines?.length) {
    // Empty state with medical icon
    const emptyY = y + 30;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    const { r, g, b } = setColor(doc, Colors.medium);
    doc.setTextColor(r, g, b);
    doc.text("💊", pageWidth / 2, emptyY, { align: "center" });

    drawText(doc, "هیچ دارویی تجویز نشده است", pageWidth / 2, emptyY + 20, {
      fontSize: 11,
      color: Colors.medium,
      align: "center",
    });

    return emptyY + 40;
  }

  let currentY = y + 10;

  medicines.forEach((med, index) => {
    const cardHeight = 75;

    // Check if we need a new page
    if (currentY + cardHeight > 720) {
      doc.addPage();
      currentY = 100;
    }

    // Medicine card with medical styling
    const cardBg = Colors.cardBg;
    const { r: cr, g: cg, b: cb } = setColor(doc, cardBg);
    doc.setFillColor(cr, cg, cb);
    doc.roundedRect(25, currentY, pageWidth - 50, cardHeight, 8, 8, "F");

    // Card border
    const { r: br, g: bg, b: bb } = setColor(doc, Colors.border);
    doc.setDrawColor(br, bg, bb);
    doc.setLineWidth(1);
    doc.roundedRect(25, currentY, pageWidth - 50, cardHeight, 8, 8, "S");

    // Medicine number badge
    const [pr, pg, pb] = Colors.primary;
    doc.setFillColor(pr, pg, pb);
    doc.circle(45, currentY + 20, 12, "F");
    const [wr, wg, wb] = Colors.white;
    doc.setTextColor(wr, wg, wb);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text((index + 1).toString(), 45, currentY + 24, { align: "center" });

    // Medicine name and dosage
    const medicineName = `${med.medicine} - ${med.dosage}`;
    drawText(doc, medicineName, 65, currentY + 20, {
      fontSize: 12,
      color: Colors.primary,
      font: "vazirmatn",
      style: "bold",
    });

    // Medicine details in organized layout
    const details = [
      med.form && `فرم: ${med.form}`,
      med.frequency && `تکرار: ${med.frequency}`,
      med.duration && `مدت: ${med.duration}`,
      med.route && `طریقه: ${med.route}`,
    ].filter(Boolean);

    if (details.length > 0) {
      drawText(doc, details.join(" | "), 65, currentY + 35, {
        fontSize: 9,
        color: Colors.dark,
        font: "vazirmatn",
      });
    }

    // Instructions with special formatting
    if (med.instructions) {
      drawText(doc, `دستورات: ${med.instructions}`, 65, currentY + 50, {
        fontSize: 8,
        color: Colors.medium,
        font: "vazirmatn",
      });
    }

    // Special indicators
    if (med.withFood) {
      // Food indicator
      const { r: sr, g: sg, b: sb } = setColor(doc, Colors.success);
      doc.setFillColor(sr, sg, sb);
      doc.rect(65, currentY + 55, 8, 8, "F");
      drawText(doc, "با غذا", 80, currentY + 62, {
        fontSize: 7,
        color: Colors.success,
        font: "vazirmatn",
      });
    }

    currentY += cardHeight + 15;
  });

  return currentY;
}

/** ✅ Enhanced footer with professional medical styling */
function createFooter(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const footerHeight = 60;

  // Footer background
  const { r: lr, g: lg, b: lb } = setColor(doc, Colors.light);
  doc.setFillColor(lr, lg, lb);
  doc.rect(0, pageHeight - footerHeight, pageWidth, footerHeight, "F");

  // Footer top border
  const { r: br, g: bg, b: bb } = setColor(doc, Colors.border);
  doc.setDrawColor(br, bg, bb);
  doc.setLineWidth(1.5);
  doc.line(0, pageHeight - footerHeight, pageWidth, pageHeight - footerHeight);

  // Footer content
  const footerY = pageHeight - 40;
  const centerX = pageWidth / 2;
  const { r: mr, g: mg, b: mb } = setColor(doc, Colors.medium);

  // Medical disclaimer
  drawText(
    doc,
    "این نسخه به‌صورت خودکار تولید شده و نیاز به امضاء ندارد",
    centerX,
    footerY,
    {
      fontSize: 9,
      color: [mr, mg, mb],
      align: "center",
      font: "vazirmatn",
    }
  );

  drawText(
    doc,
    "This prescription was computer-generated and does not require physical signature",
    centerX,
    footerY + 12,
    {
      fontSize: 8,
      color: [mr, mg, mb],
      align: "center",
    }
  );

  // Clinic information
  drawText(
    doc,
    "Dr. Sebghat Medical Center - Professional Healthcare Services",
    centerX,
    footerY + 24,
    {
      fontSize: 7,
      color: [mr, mg, mb],
      align: "center",
    }
  );

  // Page number and timestamp
  const pageInfo = doc.getCurrentPageInfo();
  drawText(doc, `صفحه ${pageInfo.pageNumber}`, pageWidth - 30, footerY + 24, {
    fontSize: 7,
    color: [mr, mg, mb],
    align: "right",
  });

  // QR Code placeholder (for future enhancement)
  drawText(doc, "🔗 Digital Verification", pageWidth - 30, footerY + 12, {
    fontSize: 6,
    color: [mr, mg, mb],
    align: "right",
  });
}

/** ✅ Generate comprehensive bilingual & RTL PDF with watermarks and professional medical design */
export async function generatePrescriptionPDF(
  prescription: Prescription & { medicines: Medicine[] }
): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
    compress: true,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Add watermark background with medical theme
  addWatermark(doc);

  // Create enhanced header with logo
  await createHeader(doc, prescription);

  let y = 120; // Start below header

  // Patient Information Section
  y = drawSectionHeader(doc, y, "Patient Information", "معلومات بیمار");
  y = addBilingualField(doc, y, "Name", prescription.patientName, "نام");
  y = addBilingualField(doc, y, "Age", prescription.patientAge, "سن");
  y = addBilingualField(doc, y, "Gender", prescription.patientGender, "جنسیت");
  y = addBilingualField(doc, y, "Phone", prescription.patientPhone, "تلفن");
  y = addBilingualField(doc, y, "Address", prescription.patientAddress, "آدرس");

  // Chief Complaint Section
  if (prescription.chiefComplaint) {
    y = drawSectionHeader(doc, y, "Chief Complaint", "شکایت اصلی");
    y = addBilingualField(
      doc,
      y,
      "Complaint",
      prescription.chiefComplaint,
      "شکایت"
    );
  }

  // Medical History Section
  y = drawSectionHeader(doc, y, "Medical History", "سابقه پزشکی");
  y = addBilingualField(
    doc,
    y,
    "Allergies",
    formatArrayData(prescription.allergies),
    "حساسیت‌ها"
  );
  y = addBilingualField(
    doc,
    y,
    "Current Medications",
    formatArrayData(prescription.currentMedications),
    "داروهای فعلی"
  );
  y = addBilingualField(
    doc,
    y,
    "Past History",
    prescription.pastMedicalHistory,
    "سوابق گذشته"
  );
  y = addBilingualField(
    doc,
    y,
    "Family History",
    prescription.familyHistory,
    "سابقه خانوادگی"
  );

  // Diagnosis Section
  y = drawSectionHeader(doc, y, "Clinical Diagnosis", "تشخیص بالینی");
  y = addBilingualField(
    doc,
    y,
    "Primary Diagnosis",
    prescription.diagnosis,
    "تشخیص اصلی"
  );
  if (prescription.differentialDiagnosis) {
    y = addBilingualField(
      doc,
      y,
      "Differential Diagnosis",
      prescription.differentialDiagnosis,
      "تشخیص تفریقی"
    );
  }

  // Vital Signs Section (if available)
  const hasVitals =
    prescription.pulseRate ||
    prescription.bloodPressure ||
    prescription.temperature ||
    prescription.respiratoryRate ||
    prescription.oxygenSaturation;

  if (hasVitals) {
    y = drawSectionHeader(
      doc,
      y,
      "Vital Signs & Measurements",
      "علائم حیاتی و اندازه‌گیری‌ها"
    );
    y = addBilingualField(doc, y, "Pulse Rate", prescription.pulseRate, "نبض");
    y = addBilingualField(
      doc,
      y,
      "Blood Pressure",
      prescription.bloodPressure,
      "فشار خون"
    );
    y = addBilingualField(
      doc,
      y,
      "Temperature",
      prescription.temperature,
      "دما"
    );
    y = addBilingualField(
      doc,
      y,
      "Respiratory Rate",
      prescription.respiratoryRate,
      "معدل تنفس"
    );
    y = addBilingualField(
      doc,
      y,
      "Oxygen Saturation",
      prescription.oxygenSaturation,
      "اشباع اکسیژن"
    );
  }

  // Physical Examination Section
  if (prescription.physicalExamination) {
    y = drawSectionHeader(doc, y, "Physical Examination", "معاینه فیزیکی");
    y = addBilingualField(
      doc,
      y,
      "Examination",
      prescription.physicalExamination,
      "معاینه"
    );
  }

  // Medicines Section
  y = drawSectionHeader(doc, y, "Prescribed Medications", "داروهای تجویز شده");
  y = addMedicineSection(doc, y, prescription.medicines);

  // Treatment Instructions Section
  if (
    prescription.instructions ||
    prescription.followUp ||
    prescription.restrictions
  ) {
    y = drawSectionHeader(doc, y, "Treatment Instructions", "دستورات درمانی");
    y = addBilingualField(
      doc,
      y,
      "General Instructions",
      prescription.instructions,
      "دستورات عمومی"
    );
    y = addBilingualField(doc, y, "Follow-up", prescription.followUp, "پیگیری");
    y = addBilingualField(
      doc,
      y,
      "Restrictions",
      prescription.restrictions,
      "محدودیت‌ها"
    );
  }

  // Doctor Information Section
  y = drawSectionHeader(doc, y, "Medical Practitioner", "اطلاعات پزشک");
  y = addBilingualField(doc, y, "Doctor", prescription.doctorName, "نام پزشک");
  y = addBilingualField(
    doc,
    y,
    "License Number",
    prescription.doctorLicenseNumber,
    "شماره پروانه"
  );
  y = addBilingualField(doc, y, "Clinic", prescription.clinicName, "کلینیک");
  y = addBilingualField(
    doc,
    y,
    "Clinic Address",
    prescription.clinicAddress,
    "آدرس کلینیک"
  );
  y = addBilingualField(
    doc,
    y,
    "Doctor Fee",
    prescription.doctorFree,
    "هزینه ویزیت"
  );

  // AI Information Section (if available)
  if (prescription.aiConfidence || prescription.aiModelUsed) {
    y = drawSectionHeader(doc, y, "AI Analysis", "تحلیل هوش مصنوعی");
    y = addBilingualField(
      doc,
      y,
      "AI Confidence",
      prescription.aiConfidence,
      "سطح اطمینان AI"
    );
    y = addBilingualField(
      doc,
      y,
      "AI Model",
      prescription.aiModelUsed,
      "مدل AI"
    );
    if (prescription.processingTime) {
      y = addBilingualField(
        doc,
        y,
        "Processing Time",
        `${prescription.processingTime}ms`,
        "زمان پردازش"
      );
    }
  }

  // History of Present Illness Section
  if (prescription.historyOfPresentIllness) {
    y = drawSectionHeader(
      doc,
      y,
      "History of Present Illness",
      "تاریخچه بیماری فعلی"
    );
    y = addBilingualField(
      doc,
      y,
      "History",
      prescription.historyOfPresentIllness,
      "تاریخچه"
    );
  }

  // Create enhanced footer
  createFooter(doc);

  // Save file with improved naming
  const safeName = prescription.patientName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");

  const timestamp = formatDateSafe(prescription.createdAt, "yyyyMMdd-HHmm");
  const fileName = `Medical-Prescription-${safeName}-${timestamp}.pdf`;

  doc.save(fileName);
}

export const downloadPrescriptionPDF = generatePrescriptionPDF;
