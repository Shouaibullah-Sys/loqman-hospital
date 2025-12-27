// utils/generatePrescriptionPDF.ts

import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { format as formatJalali } from "date-fns-jalali";
import "../vazirmatn-normal.js"; // Unicode font (Vazirmatn) already converted to JS

export interface Medication {
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  form?: string;
  route?: string;
  timing?: string;
  withFood?: boolean;
  notes?: string;
}

export interface VoicePrescription {
  _id: string;
  patientName: string;
  patientAge?: string;
  patientGender?: string;
  patientPhone?: string;
  patientAddress?: string;
  allergies?: string[];
  currentMedications?: string[];
  medicationUsage?: string; // Legacy field
  pastMedicalHistory?: string;
  familyHistory?: string;
  socialHistory?: string;
  chiefComplaint?: string;
  weight?: string;
  height?: string;
  bmi?: string;
  pulseRate?: string;
  heartRate?: string;
  bloodPressure?: string;
  temperature?: string;
  respiratoryRate?: string;
  oxygenSaturation?: string;
  physicalExam?: string;
  medicalExams?: string[];
  examNotes?: string;
  medicines: Medication[];
  instructions?: string;
  followUp?: string;
  restrictions?: string;
  doctorName: string;
  doctorLicenseNumber?: string;
  clinicName?: string;
  clinicAddress?: string;
  date: string;
  transcription?: string;
  source?: string;
  status?: string;
}

/**
 * Helper function to format vital signs value or return "N/A" if empty
 */
function formatVitalValue(value?: string): string {
  if (!value || value.trim() === "") {
    return "N/A";
  }
  return value.trim();
}

/**
 * Check if text contains Persian/Arabic characters
 */
function hasPersianOrArabic(text: string): boolean {
  // Persian/Arabic Unicode ranges
  const persianRange =
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return persianRange.test(text);
}

/**
 * Helper function to add Persian text with fallback fonts
 */
function addPersianTextToPDF(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  options?: any
) {
  const style = options?.style || "normal";
  const fontSize = options?.fontSize || doc.getFontSize();

  // Save current font size
  const currentFontSize = doc.getFontSize();

  // Set font size if specified
  if (options?.fontSize) {
    doc.setFontSize(fontSize);
  }

  try {
    // First try with Vazirmatn
    doc.setFont("vazirmatn", style);
    doc.text(text, x, y, options);
  } catch (e) {
    // Fallback to built-in font that supports Arabic/Persian
    console.warn(
      "Vazirmatn failed, using fallback font for:",
      text.substring(0, 20)
    );

    // Try 'arabic' font (if available in your jsPDF setup)
    try {
      doc.setFont("arabic", style);
      doc.text(text, x, y, options);
    } catch (e2) {
      // Last resort: use default font
      doc.setFont("helvetica", style);
      doc.text(text, x, y, options);
    }
  }

  // Restore font size if it was changed
  if (options?.fontSize) {
    doc.setFontSize(currentFontSize);
  }
}

/**
 * Create a formatted two-column prescription PDF
 */
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

  // --- THEME COLORS ---
  const primary = [42, 94, 168];
  const accent = [66, 133, 244];
  const bgLight = [244, 247, 252];
  const textDark = [40, 40, 40];
  const borderColor = [200, 200, 200];

  // --- TOP SECTION (Header with Logo and Patient Info) ---
  let y = 40; // Start with some top margin

  // Logo at the top
  const logoUrl = "/logo.png";
  let logoBase64: string | undefined = undefined;

  try {
    const response = await fetch(logoUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch logo: ${response.statusText}`);
    }
    const blob = await response.blob();
    logoBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

    // Add logo
    const logoW = 80;
    const logoH = 80;
    const logoX = (pageWidth - logoW) / 2; // Center logo
    doc.addImage(logoBase64, "PNG", logoX, y, logoW, logoH);
    y += logoH + 20; // Space after logo
  } catch (error) {
    console.warn("Could not load logo:", error);
    // Continue without logo
    y += 20;
  }

  // Clinic/Doctor Info Line
  const centerX = pageWidth / 2;

  // Clinic Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.text(prescription.clinicName || "Medical Center", centerX, y, {
    align: "center",
  });

  // Persian clinic name
  y += 18;
  const clinicNamePersian =
    prescription.clinicName === "Specialty Clinic"
      ? "کلینیک تخصصی"
      : prescription.clinicName === "Imam Reza Hospital"
      ? "شفاخانه امام رضا"
      : prescription.clinicName === "Noor Medical Center"
      ? "مرکز طبی نور"
      : prescription.clinicName === "Children's Hospital"
      ? "شفاخانه کودکان"
      : "مرکز طبی";
  addPersianTextToPDF(doc, clinicNamePersian, centerX, y, {
    align: "center",
    style: "normal",
    fontSize: 14,
  });

  // Doctor Name
  y += 25;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(prescription.doctorName, centerX, y, { align: "center" });

  // Persian doctor name
  y += 16;
  const doctorNamePersian =
    prescription.doctorName === "Dr. Ahmad Farid"
      ? "داکتر احمد فرید"
      : prescription.doctorName === "Dr. Maryam Hosseini"
      ? "داکتر مریم حسینی"
      : prescription.doctorName === "Dr. Ali Rezaei"
      ? "داکتر علی رضایی"
      : prescription.doctorName === "Dr. Sara Mohammadi"
      ? "داکتر سارا محمدی"
      : prescription.doctorName;
  addPersianTextToPDF(doc, doctorNamePersian, centerX, y, {
    align: "center",
    style: "normal",
    fontSize: 12,
  });

  // License Number if available
  if (prescription.doctorLicenseNumber) {
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(`License: ${prescription.doctorLicenseNumber}`, centerX, y, {
      align: "center",
    });
  }

  // Top Separator Line
  y += 25;
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(1);
  doc.line(40, y, pageWidth - 40, y);

  // --- PATIENT INFORMATION BLOCK ---
  y += 20;

  // Create a box for patient info
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(accent[0], accent[1], accent[2]);
  doc.setLineWidth(1);
  doc.roundedRect(40, y - 10, pageWidth - 80, 70, 5, 5, "FD");

  // Patient Information Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.text("Patient Information", 60, y + 5);
  addPersianTextToPDF(doc, "معلومات مریض", pageWidth - 60, y + 5, {
    align: "right",
    style: "normal",
  });

  // Format date
  const formattedDate = prescription.date
    ? formatJalali(new Date(prescription.date), "yyyy/MM/dd")
    : formatJalali(new Date(), "yyyy/MM/dd");

  // Patient Info Grid
  const patientInfoRows = [
    {
      label: "Name / نام:",
      value: prescription.patientName || "N/A",
      persianLabel: "نام",
    },
    {
      label: "Age / عمر:",
      value: prescription.patientAge
        ? `${prescription.patientAge} years`
        : "N/A",
      persianLabel: "عمر",
    },
    {
      label: "Gender / جنس:",
      value: prescription.patientGender || "N/A",
      persianLabel: "جنس",
    },
    {
      label: "Date / تاریخ:",
      value: formattedDate,
      persianLabel: "تاریخ",
    },
    {
      label: "Weight / وزن:",
      value: prescription.weight ? `${prescription.weight} kg` : "N/A",
      persianLabel: "وزن",
    },
    {
      label: "Height / قد:",
      value: prescription.height ? `${prescription.height} cm` : "N/A",
      persianLabel: "قد",
    },
    {
      label: "BMI:",
      value: prescription.bmi || "N/A",
      persianLabel: "بی ام آی",
    },
    {
      label: "Phone / تلیفون:",
      value: prescription.patientPhone || "N/A",
      persianLabel: "تلیفون",
    },
  ];

  const columnWidth = (pageWidth - 100) / 4; // 4 columns for patient info
  const rowHeight = 16;
  let rowY = y + 25;

  patientInfoRows.forEach((info, index) => {
    const col = index % 4;
    const row = Math.floor(index / 4);
    const xPos = 50 + col * columnWidth;
    const yPos = rowY + row * rowHeight;

    // Label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(primary[0], primary[1], primary[2]);
    doc.text(info.label, xPos, yPos);

    // Value
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);

    const valueContainsPersian = hasPersianOrArabic(info.value);
    if (valueContainsPersian) {
      addPersianTextToPDF(doc, info.value, xPos + 60, yPos, {
        style: "normal",
        fontSize: 9,
      });
    } else {
      doc.text(info.value, xPos + 60, yPos);
    }
  });

  // Adjust y position for the main content
  y += 100; // Height of patient info block + spacing

  // --- TWO COLUMN LAYOUT ---
  const leftColumnX = 40;
  const rightColumnX = pageWidth * 0.25; // Left column takes 25% of width
  const leftColumnWidth = pageWidth * 0.25 - 50;
  const rightColumnWidth = pageWidth * 0.75 - 60;

  // Draw vertical separator line
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(0.5);
  doc.line(rightColumnX - 15, y, rightColumnX - 15, pageHeight - 100);

  // Initialize y positions for both columns
  let yLeft = y + 20;
  let yRight = y + 20;

  // --- LEFT COLUMN: CLINICAL HISTORY ---

  // Function to add section in left column
  const addLeftColumnSection = (
    titleEn: string,
    titleFa: string,
    content: string
  ) => {
    // Section header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(primary[0], primary[1], primary[2]);
    doc.text(titleEn, leftColumnX, yLeft);

    // Persian title
    addPersianTextToPDF(doc, titleFa, leftColumnX + leftColumnWidth, yLeft, {
      align: "right",
      style: "normal",
      fontSize: 10,
    });

    yLeft += 15;

    // Content box
    doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(leftColumnX, yLeft - 5, leftColumnWidth, 40, 3, 3, "FD");

    // Content text
    const contentContainsPersian = hasPersianOrArabic(content);
    if (contentContainsPersian) {
      const contentLines = doc.splitTextToSize(content, leftColumnWidth - 20);
      contentLines.forEach((line: string, index: number) => {
        addPersianTextToPDF(
          doc,
          line,
          leftColumnX + 10,
          yLeft + 8 + index * 12,
          {
            style: "normal",
            fontSize: 9,
          }
        );
      });
      yLeft += Math.max(40, contentLines.length * 12 + 10);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      const contentLines = doc.splitTextToSize(content, leftColumnWidth - 20);
      doc.text(contentLines, leftColumnX + 10, yLeft + 8);
      yLeft += Math.max(40, contentLines.length * 12 + 10);
    }

    yLeft += 15; // Spacing between sections
  };

  // Function to add list section in left column
  const addLeftColumnListSection = (
    titleEn: string,
    titleFa: string,
    items: string[]
  ) => {
    if (!items || items.length === 0) return;

    // Section header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(primary[0], primary[1], primary[2]);
    doc.text(titleEn, leftColumnX, yLeft);

    // Persian title
    addPersianTextToPDF(doc, titleFa, leftColumnX + leftColumnWidth, yLeft, {
      align: "right",
      style: "normal",
      fontSize: 10,
    });

    yLeft += 15;

    // Content box
    const boxHeight = Math.max(40, items.length * 15 + 20);
    doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(
      leftColumnX,
      yLeft - 5,
      leftColumnWidth,
      boxHeight,
      3,
      3,
      "FD"
    );

    // List items
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);

    items.forEach((item, index) => {
      const itemText = `${index + 1}. ${item}`;
      const itemContainsPersian = hasPersianOrArabic(item);

      if (itemContainsPersian) {
        addPersianTextToPDF(
          doc,
          itemText,
          leftColumnX + 10,
          yLeft + 8 + index * 15,
          {
            style: "normal",
            fontSize: 9,
          }
        );
      } else {
        doc.text(itemText, leftColumnX + 10, yLeft + 8 + index * 15);
      }
    });

    yLeft += boxHeight + 15;
  };

  // Add sections to left column
  // Use empty arrays as defaults for optional arrays
  const labExams = prescription.medicalExams || [];
  const allergies = prescription.allergies || [];
  const currentMedications = prescription.currentMedications || [];

  if (labExams.length > 0) {
    addLeftColumnListSection("Lab Exams", "آزمایشات", labExams);
  }

  if (allergies.length > 0) {
    addLeftColumnListSection("Allergies", "حساسیت ها", allergies);
  }

  if (currentMedications.length > 0) {
    addLeftColumnListSection("Current Meds", "دواهای فعلی", currentMedications);
  }

  if (
    prescription.pastMedicalHistory &&
    prescription.pastMedicalHistory.trim() !== ""
  ) {
    addLeftColumnSection(
      "Past Medical History",
      "تاریخچه طبی",
      prescription.pastMedicalHistory
    );
  }

  if (prescription.familyHistory && prescription.familyHistory.trim() !== "") {
    addLeftColumnSection(
      "Family History",
      "تاریخچه فامیلی",
      prescription.familyHistory
    );
  }

  if (prescription.socialHistory && prescription.socialHistory.trim() !== "") {
    addLeftColumnSection(
      "Social History",
      "تاریخچه اجتماعی",
      prescription.socialHistory
    );
  }

  // --- RIGHT COLUMN: MAIN CONTENT ---

  // Function to add section in right column
  const addRightColumnSection = (titleEn: string, titleFa: string) => {
    // Check for page break
    if (yRight > pageHeight - 100) {
      doc.addPage();
      yRight = 40;
    }

    // Section header with accent bar
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.rect(rightColumnX, yRight - 8, 5, 22, "F");

    // Section title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(primary[0], primary[1], primary[2]);
    doc.text(titleEn, rightColumnX + 15, yRight + 5);

    // Persian title
    addPersianTextToPDF(
      doc,
      titleFa,
      rightColumnX + rightColumnWidth,
      yRight + 5,
      {
        align: "right",
        style: "normal",
        fontSize: 12,
      }
    );

    yRight += 25;

    return yRight;
  };

  // Function to add vital signs grid
  const addVitalSignsGrid = () => {
    const vitalSigns = [
      {
        label: "Pulse Rate",
        value: prescription.pulseRate || "N/A",
        unit: "bpm",
        persian: "ضربان نبض",
      },
      {
        label: "Blood Pressure",
        value: prescription.bloodPressure || "N/A",
        unit: "",
        persian: "فشار خون",
      },
      {
        label: "Heart Rate",
        value: prescription.heartRate || "N/A",
        unit: "bpm",
        persian: "ضربان قلب",
      },
      {
        label: "Temperature",
        value: prescription.temperature || "N/A",
        unit: "°C",
        persian: "حرارت بدن",
      },
      {
        label: "Respiratory Rate",
        value: prescription.respiratoryRate || "N/A",
        unit: "/min",
        persian: "معدل تنفس",
      },
      {
        label: "Oxygen Saturation",
        value: prescription.oxygenSaturation || "N/A",
        unit: "%",
        persian: "اکسیجن خون",
      },
    ];

    // Calculate responsive grid dimensions
    const gridColumns = 3;
    const availableWidth = rightColumnWidth - 20; // Leave some padding
    const cellWidth = availableWidth / gridColumns - 5; // Subtract gap between cells
    const cellHeight = 35; // Increased height for better text fit
    const gap = 5; // Gap between cells
    const startX = rightColumnX + 10; // Add left padding
    const startY = yRight;

    vitalSigns.forEach((vital, index) => {
      const col = index % gridColumns;
      const row = Math.floor(index / gridColumns);
      const x = startX + col * (cellWidth + gap);
      const y = startY + row * (cellHeight + gap);

      // Cell background
      doc.setFillColor(250, 250, 250);
      doc.rect(x, y, cellWidth, cellHeight, "F");
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.setLineWidth(0.5);
      doc.rect(x, y, cellWidth, cellHeight, "S");

      // Calculate optimal font sizes based on cell width
      const maxLabelWidth = cellWidth - 10; // Leave padding
      const labelFontSize = Math.min(9, Math.max(7, cellWidth / 15));
      const valueFontSize = Math.min(10, Math.max(8, cellWidth / 12));
      const persianFontSize = Math.min(8, Math.max(6, cellWidth / 18));

      // Vital sign label (English)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(labelFontSize);
      doc.setTextColor(primary[0], primary[1], primary[2]);

      // Check if label fits, if not truncate
      const labelWidth = doc.getTextWidth(vital.label);
      let displayLabel = vital.label;
      if (labelWidth > maxLabelWidth) {
        // Truncate label and add ellipsis
        while (
          doc.getTextWidth(displayLabel + "...") > maxLabelWidth &&
          displayLabel.length > 0
        ) {
          displayLabel = displayLabel.slice(0, -1);
        }
        displayLabel += "...";
      }

      doc.text(displayLabel, x + 5, y + 12);

      // Persian label
      addPersianTextToPDF(doc, vital.persian, x + cellWidth - 5, y + 12, {
        align: "right",
        style: "normal",
        fontSize: persianFontSize,
        maxWidth: maxLabelWidth,
      });

      // Value with unit
      doc.setFont("helvetica", "normal");
      doc.setFontSize(valueFontSize);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);

      const valueText = `${vital.value} ${vital.unit}`.trim();

      // Center the value text in the cell
      const valueWidth = doc.getTextWidth(valueText);
      const centeredX = x + (cellWidth - valueWidth) / 2;

      // If value is too wide, reduce font size further
      let finalValueFontSize = valueFontSize;
      if (valueWidth > cellWidth - 10) {
        finalValueFontSize = Math.max(
          7,
          (((cellWidth - 10) / doc.getTextWidth("0")) * valueFontSize) / 2
        );
        doc.setFontSize(finalValueFontSize);
      }

      doc.text(valueText, Math.max(centeredX, x + 5), y + 25);
    });

    // Calculate total height needed
    const rows = Math.ceil(vitalSigns.length / gridColumns);
    const totalHeight = rows * cellHeight + (rows - 1) * gap + 10;
    yRight += totalHeight;
  };

  // --- VITAL SIGNS SECTION ---
  const hasVitalSigns = [
    prescription.pulseRate,
    prescription.bloodPressure,
    prescription.heartRate,
    prescription.temperature,
    prescription.respiratoryRate,
    prescription.oxygenSaturation,
  ].some((v) => v && v.trim() !== "");

  if (hasVitalSigns) {
    addRightColumnSection("Vital Signs", "علائم حیاتی");
    addVitalSignsGrid();
  }

  // --- CHIEF COMPLAINT ---
  if (
    prescription.chiefComplaint &&
    prescription.chiefComplaint.trim() !== ""
  ) {
    addRightColumnSection("Chief Complaint", "شکایت اصلی");

    const complaintContainsPersian = hasPersianOrArabic(
      prescription.chiefComplaint
    );
    const complaintLines = doc.splitTextToSize(
      prescription.chiefComplaint,
      rightColumnWidth - 20
    );

    if (complaintContainsPersian) {
      complaintLines.forEach((line: string, index: number) => {
        addPersianTextToPDF(doc, line, rightColumnX + 10, yRight + index * 12, {
          style: "normal",
          fontSize: 10,
        });
      });
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(complaintLines, rightColumnX + 10, yRight);
    }

    yRight += complaintLines.length * 12 + 20;
  }

  // --- PHYSICAL EXAMINATION ---
  if (prescription.physicalExam && prescription.physicalExam.trim() !== "") {
    addRightColumnSection("Physical Examination", "معاینه فزیکی");

    const examContainsPersian = hasPersianOrArabic(prescription.physicalExam);
    const examLines = doc.splitTextToSize(
      prescription.physicalExam,
      rightColumnWidth - 20
    );

    if (examContainsPersian) {
      examLines.forEach((line: string, index: number) => {
        addPersianTextToPDF(doc, line, rightColumnX + 10, yRight + index * 12, {
          style: "normal",
          fontSize: 10,
        });
      });
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(examLines, rightColumnX + 10, yRight);
    }

    yRight += examLines.length * 12 + 20;
  }

  // --- PRESCRIBED MEDICATIONS ---
  addRightColumnSection("Prescribed Medications", "دواهای تجویز شده");

  const medications = prescription.medicines || [];

  if (medications.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text("No medications prescribed.", rightColumnX + 10, yRight);
    addPersianTextToPDF(
      doc,
      "هیچ دوا تجویز نگردیده است.",
      rightColumnX + rightColumnWidth,
      yRight,
      {
        align: "right",
        style: "normal",
      }
    );
    yRight += 20;
  } else {
    // Create a table for medications
    const tableTop = yRight;
    const rowHeight = 20;
    const columnWidths = [30, 100, 70, 70, 70, 80]; // Adjust based on your needs

    // Table headers
    const headers = [
      "No.",
      "Medicine",
      "Dosage",
      "Frequency",
      "Duration",
      "Instructions",
    ];
    const persianHeaders = [
      "شماره",
      "دوا",
      "مقدار",
      "فراوانی",
      "مدت",
      "دستورات",
    ];

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(primary[0], primary[1], primary[2]);

    let xPos = rightColumnX + 10;
    headers.forEach((header, index) => {
      const padding = index === 0 ? 2 : 8; // Consistent with data alignment
      const availableWidth = columnWidths[index] - padding * 2;

      doc.text(header, xPos + padding, tableTop, {
        maxWidth: availableWidth,
        align: "left",
      });
      xPos += columnWidths[index];
    });

    // Persian headers on right side
    xPos = rightColumnX + rightColumnWidth;
    persianHeaders.reverse().forEach((header, index) => {
      const columnIndex = persianHeaders.length - 1 - index;
      const padding = columnIndex === 0 ? 2 : 8; // Consistent with data alignment

      addPersianTextToPDF(doc, header, xPos - padding, tableTop, {
        align: "right",
        style: "normal",
        fontSize: 9,
        maxWidth: columnWidths[columnIndex] - padding * 2,
      });
      xPos -= columnWidths[columnIndex];
    });

    // Header separator line
    yRight += 5;
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.setLineWidth(0.5);
    doc.line(
      rightColumnX + 10,
      yRight,
      rightColumnX + rightColumnWidth,
      yRight
    );
    yRight += 10;

    // Medication rows
    medications.forEach((med: Medication, index: number) => {
      if (yRight > pageHeight - 100) {
        doc.addPage();
        yRight = 40;
        // Re-add headers on new page
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(primary[0], primary[1], primary[2]);
        let xPos = rightColumnX + 10;
        headers.forEach((header, i) => {
          const padding = i === 0 ? 2 : 8; // Consistent with main headers
          const availableWidth = columnWidths[i] - padding * 2;

          doc.text(header, xPos + padding, yRight - 20, {
            maxWidth: availableWidth,
            align: "left",
          });
          xPos += columnWidths[i];
        });
        yRight += 5;
        doc.line(
          rightColumnX + 10,
          yRight,
          rightColumnX + rightColumnWidth,
          yRight
        );
        yRight += 10;
      }

      // Row data
      const rowData = [
        `${index + 1}.`,
        med.medicine || "N/A",
        med.dosage || "N/A",
        med.frequency || "N/A",
        med.duration || "N/A",
        med.instructions || "N/A",
      ];

      // Draw row background for alternating colors
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(
          rightColumnX + 10,
          yRight - 8,
          rightColumnWidth - 20,
          rowHeight,
          "F"
        );
      }

      // Draw row data
      xPos = rightColumnX + 10;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);

      rowData.forEach((data, colIndex) => {
        const dataContainsPersian = hasPersianOrArabic(data);
        const padding = colIndex === 0 ? 2 : 8; // Less padding for number column
        const availableWidth = columnWidths[colIndex] - padding * 2;

        if (dataContainsPersian) {
          addPersianTextToPDF(doc, data, xPos + padding, yRight, {
            style: "normal",
            fontSize: 9,
            maxWidth: availableWidth,
            align: "left",
          });
        } else {
          doc.text(data, xPos + padding, yRight, {
            maxWidth: availableWidth,
            align: "left",
          });
        }
        xPos += columnWidths[colIndex];
      });

      yRight += rowHeight;

      // Additional medication details if available
      const additionalDetails = [];
      if (med.form && med.form.trim() !== "")
        additionalDetails.push(`Form: ${med.form}`);
      if (med.route && med.route.trim() !== "")
        additionalDetails.push(`Route: ${med.route}`);
      if (med.timing && med.timing.trim() !== "")
        additionalDetails.push(`Timing: ${med.timing}`);
      if (med.notes && med.notes.trim() !== "")
        additionalDetails.push(`Notes: ${med.notes}`);

      if (additionalDetails.length > 0) {
        const detailsText = additionalDetails.join(" | ");
        const detailsContainsPersian = hasPersianOrArabic(detailsText);

        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);

        if (detailsContainsPersian) {
          addPersianTextToPDF(doc, detailsText, rightColumnX + 45, yRight, {
            style: "italic",
            fontSize: 8,
            maxWidth: rightColumnWidth - 55,
            align: "left",
          });
        } else {
          doc.text(detailsText, rightColumnX + 45, yRight, {
            maxWidth: rightColumnWidth - 55,
            align: "left",
          });
        }

        yRight += 12;
      }

      yRight += 5; // Spacing between rows
    });
  }

  // --- ADDITIONAL INSTRUCTIONS ---
  const hasAdditionalInstructions =
    (prescription.instructions && prescription.instructions.trim() !== "") ||
    (prescription.followUp && prescription.followUp.trim() !== "") ||
    (prescription.restrictions && prescription.restrictions.trim() !== "");

  if (hasAdditionalInstructions) {
    addRightColumnSection("Additional Instructions", "دستورات اضافی");

    if (prescription.instructions && prescription.instructions.trim() !== "") {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text("General Instructions:", rightColumnX + 10, yRight);

      const instructionsContainsPersian = hasPersianOrArabic(
        prescription.instructions
      );
      const instructionLines = doc.splitTextToSize(
        prescription.instructions,
        rightColumnWidth - 30
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);

      if (instructionsContainsPersian) {
        instructionLines.forEach((line: string, index: number) => {
          addPersianTextToPDF(
            doc,
            line,
            rightColumnX + 30,
            yRight + 15 + index * 12,
            {
              style: "normal",
              fontSize: 9,
            }
          );
        });
      } else {
        doc.text(instructionLines, rightColumnX + 30, yRight + 15);
      }

      yRight += instructionLines.length * 12 + 25;
    }

    if (prescription.followUp && prescription.followUp.trim() !== "") {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text("Follow-up:", rightColumnX + 10, yRight);

      const followUpContainsPersian = hasPersianOrArabic(prescription.followUp);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);

      if (followUpContainsPersian) {
        addPersianTextToPDF(
          doc,
          prescription.followUp,
          rightColumnX + 30,
          yRight + 12,
          {
            style: "normal",
            fontSize: 9,
          }
        );
      } else {
        doc.text(prescription.followUp, rightColumnX + 30, yRight + 12);
      }

      yRight += 25;
    }

    if (prescription.restrictions && prescription.restrictions.trim() !== "") {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text("Restrictions:", rightColumnX + 10, yRight);

      const restrictionsContainsPersian = hasPersianOrArabic(
        prescription.restrictions
      );
      const restrictionLines = doc.splitTextToSize(
        prescription.restrictions,
        rightColumnWidth - 30
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);

      if (restrictionsContainsPersian) {
        restrictionLines.forEach((line: string, index: number) => {
          addPersianTextToPDF(
            doc,
            line,
            rightColumnX + 30,
            yRight + 15 + index * 12,
            {
              style: "normal",
              fontSize: 9,
            }
          );
        });
      } else {
        doc.text(restrictionLines, rightColumnX + 30, yRight + 15);
      }

      yRight += restrictionLines.length * 12 + 20;
    }
  }

  // --- DOCTOR SIGNATURE ---
  // Add signature at the bottom right
  const signatureY = Math.max(yLeft, yRight) + 40;

  // Signature line
  doc.setDrawColor(textDark[0], textDark[1], textDark[2]);
  doc.setLineWidth(0.5);
  doc.line(
    rightColumnX + rightColumnWidth - 200,
    signatureY,
    rightColumnX + rightColumnWidth,
    signatureY
  );

  // Doctor name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.text(
    prescription.doctorName,
    rightColumnX + rightColumnWidth - 100,
    signatureY + 20,
    { align: "center" }
  );

  // Title
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(
    "Medical Practitioner",
    rightColumnX + rightColumnWidth - 100,
    signatureY + 35,
    { align: "center" }
  );

  // Persian text
  addPersianTextToPDF(
    doc,
    prescription.doctorName,
    rightColumnX + rightColumnWidth - 100,
    signatureY + 55,
    {
      align: "center",
      style: "normal",
      fontSize: 12,
    }
  );
  addPersianTextToPDF(
    doc,
    "داکتر معالج",
    rightColumnX + rightColumnWidth - 100,
    signatureY + 70,
    {
      align: "center",
      style: "normal",
      fontSize: 10,
    }
  );

  // --- FOOTER ---
  const footerY = pageHeight - 40;

  // Prescription ID
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(`Prescription ID: ${prescription._id}`, 40, footerY);

  // Page number
  doc.text(`Page 1 of 1`, pageWidth - 40, footerY, { align: "right" });

  // Digital prescription note
  const digitalText = "این یک نسخه دیجیتال تولید شده توسط کامپیوتر است.";
  addPersianTextToPDF(doc, digitalText, pageWidth / 2, footerY + 15, {
    align: "center",
    style: "normal",
    fontSize: 8,
  });

  // Save the PDF
  let prescriptionDate: Date;
  try {
    prescriptionDate = new Date(prescription.date);
    if (isNaN(prescriptionDate.getTime())) {
      prescriptionDate = new Date();
    }
  } catch (error) {
    prescriptionDate = new Date();
  }

  const fileName = `prescription-${prescription.patientName
    .toLowerCase()
    .replace(/\s+/g, "-")}-${format(prescriptionDate, "yyyy-MM-dd")}.pdf`;

  doc.save(fileName);
}

// Export with the expected name for backward compatibility
export const downloadPrescriptionPDF = generatePrescriptionPDF;
