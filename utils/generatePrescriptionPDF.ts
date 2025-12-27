// utils/generatePrescriptionPDF.ts

import { jsPDF } from "jspdf";
import { format } from "date-fns";

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
  medicationUsage?: string;
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

// ==================== CONFIGURATION INTERFACE ====================
export interface PDFConfig {
  // Page Layout
  page: {
    orientation: "portrait" | "landscape";
    unit: "pt" | "mm" | "cm" | "in";
    format: "a4" | "letter" | "legal";
    margins: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  };

  // Colors
  colors: {
    primary: [number, number, number];
    accent: [number, number, number];
    bgLight: [number, number, number];
    textDark: [number, number, number];
    border: [number, number, number];
    tableStriped: [number, number, number];
    warning: [number, number, number];
    success: [number, number, number];
  };

  // Typography
  typography: {
    defaultFont: string;
    fontSizes: {
      title: number;
      subtitle: number;
      heading: number;
      subheading: number;
      body: number;
      small: number;
      tiny: number;
    };
    lineHeights: {
      tight: number;
      normal: number;
      loose: number;
    };
  };

  // Logo
  logo: {
    enabled: boolean;
    url: string;
    width: number;
    height: number;
    position: "left" | "center" | "right";
    marginTop: number;
    marginBottom: number;
  };

  // Layout Structure
  layout: {
    twoColumn: boolean;
    leftColumnWidth: number;
    rightColumnWidth: number;
    columnGap: number;
    sectionSpacing: number;
    blockSpacing: number;
    lineSpacing: number;
  };

  // Patient Info
  patientInfo: {
    show: boolean;
    boxStyle: "rounded" | "flat" | "shadow";
    borderRadius: number;
    columns: number;
    showLabels: boolean;
    labelStyle: "bold" | "normal" | "italic";
    include: string[];
  };

  // Clinical History (Left Column)
  clinicalHistory: {
    show: boolean;
    sections: {
      labExams: boolean;
      allergies: boolean;
      currentMeds: boolean;
      pastMedicalHistory: boolean;
      familyHistory: boolean;
      socialHistory: boolean;
    };
    boxStyle: "rounded" | "flat";
    boxHeight: number;
  };

  // Vital Signs
  vitalSigns: {
    show: boolean;
    gridColumns: number;
    cell: {
      width: number;
      height: number;
      gap: number;
      borderRadius: number;
    };
    include: string[];
    showUnits: boolean;
  };

  // Medications Table
  medications: {
    show: boolean;
    table: {
      headers: string[];
      columnWidths: number[];
      rowHeight: number;
      stripedRows: boolean;
      showRowNumbers: boolean;
      showAdditionalDetails: boolean;
    };
  };

  // Additional Instructions
  instructions: {
    show: boolean;
    sections: {
      general: boolean;
      followUp: boolean;
      restrictions: boolean;
    };
    indent: number;
  };

  // Doctor Signature
  signature: {
    show: boolean;
    position: "left" | "center" | "right";
    lineWidth: number;
    lineLength: number;
    includeTitle: boolean;
  };

  // Footer
  footer: {
    show: boolean;
    showPrescriptionId: boolean;
    showPageNumbers: boolean;
    showDigitalNote: boolean;
    height: number;
  };

  // Page Break Control
  pageBreak: {
    enabled: boolean;
    minBottomMargin: number;
    repeatHeaders: boolean;
  };

  // Debug/Development
  debug: {
    showBorders: boolean;
    showGrid: boolean;
    logPositions: boolean;
  };
}

// ==================== DEFAULT CONFIGURATION ====================
export const defaultPDFConfig: PDFConfig = {
  page: {
    orientation: "portrait",
    unit: "pt",
    format: "a4",
    margins: { top: 40, bottom: 40, left: 40, right: 40 },
  },

  colors: {
    primary: [42, 94, 168],
    accent: [66, 133, 244],
    bgLight: [244, 247, 252],
    textDark: [40, 40, 40],
    border: [200, 200, 200],
    tableStriped: [250, 250, 250],
    warning: [255, 193, 7],
    success: [40, 167, 69],
  },

  typography: {
    defaultFont: "helvetica",
    fontSizes: {
      title: 16,
      subtitle: 14,
      heading: 12,
      subheading: 10,
      body: 10,
      small: 9,
      tiny: 8,
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      loose: 1.8,
    },
  },

  logo: {
    enabled: true,
    url: "/logo.png",
    width: 80,
    height: 80,
    position: "center",
    marginTop: 40,
    marginBottom: 20,
  },

  layout: {
    twoColumn: true,
    leftColumnWidth: 0.25,
    rightColumnWidth: 0.75,
    columnGap: 15,
    sectionSpacing: 25,
    blockSpacing: 15,
    lineSpacing: 5,
  },

  patientInfo: {
    show: true,
    boxStyle: "rounded",
    borderRadius: 5,
    columns: 4,
    showLabels: true,
    labelStyle: "bold",
    include: [
      "name",
      "age",
      "gender",
      "date",
      "weight",
      "height",
      "bmi",
      "phone",
    ],
  },

  clinicalHistory: {
    show: true,
    sections: {
      labExams: true,
      allergies: true,
      currentMeds: true,
      pastMedicalHistory: true,
      familyHistory: true,
      socialHistory: true,
    },
    boxStyle: "rounded",
    boxHeight: 40,
  },

  vitalSigns: {
    show: true,
    gridColumns: 3,
    cell: {
      width: 120,
      height: 35,
      gap: 5,
      borderRadius: 3,
    },
    include: ["pulse", "bp", "heart", "temp", "respiratory", "oxygen"],
    showUnits: true,
  },

  medications: {
    show: true,
    table: {
      headers: [
        "No.",
        "Medicine",
        "Dosage",
        "Frequency",
        "Duration",
        "Instructions",
      ],
      columnWidths: [30, 100, 70, 70, 70, 80],
      rowHeight: 20,
      stripedRows: true,
      showRowNumbers: true,
      showAdditionalDetails: true,
    },
  },

  instructions: {
    show: true,
    sections: {
      general: true,
      followUp: true,
      restrictions: true,
    },
    indent: 20,
  },

  signature: {
    show: true,
    position: "right",
    lineWidth: 0.5,
    lineLength: 200,
    includeTitle: true,
  },

  footer: {
    show: true,
    showPrescriptionId: true,
    showPageNumbers: true,
    showDigitalNote: true,
    height: 40,
  },

  pageBreak: {
    enabled: true,
    minBottomMargin: 100,
    repeatHeaders: true,
  },

  debug: {
    showBorders: false,
    showGrid: false,
    logPositions: false,
  },
};

// ==================== HELPER FUNCTIONS ====================

function formatVitalValue(value?: string): string {
  if (!value || value.trim() === "") {
    return "N/A";
  }
  return value.trim();
}

function checkPageBreak(
  doc: jsPDF,
  currentY: number,
  requiredSpace: number,
  config: PDFConfig
): number {
  if (!config.pageBreak.enabled) return currentY;

  const pageHeight = doc.internal.pageSize.getHeight();
  const bottomMargin = config.page.margins.bottom;

  if (
    currentY + requiredSpace >
    pageHeight - config.pageBreak.minBottomMargin
  ) {
    doc.addPage();
    if (config.debug.logPositions) {
      console.log(`Page break at Y=${currentY}, needed ${requiredSpace}px`);
    }
    return config.page.margins.top;
  }
  return currentY;
}

// ==================== MAIN PDF GENERATION FUNCTION ====================

export async function generatePrescriptionPDF(
  prescription: VoicePrescription,
  userConfig?: Partial<PDFConfig>
): Promise<void> {
  // Merge user config with default config
  const config: PDFConfig = {
    ...defaultPDFConfig,
    ...userConfig,
    page: { ...defaultPDFConfig.page, ...userConfig?.page },
    colors: { ...defaultPDFConfig.colors, ...userConfig?.colors },
    typography: { ...defaultPDFConfig.typography, ...userConfig?.typography },
    logo: { ...defaultPDFConfig.logo, ...userConfig?.logo },
    layout: { ...defaultPDFConfig.layout, ...userConfig?.layout },
    patientInfo: {
      ...defaultPDFConfig.patientInfo,
      ...userConfig?.patientInfo,
    },
    clinicalHistory: {
      ...defaultPDFConfig.clinicalHistory,
      ...userConfig?.clinicalHistory,
    },
    vitalSigns: { ...defaultPDFConfig.vitalSigns, ...userConfig?.vitalSigns },
    medications: {
      ...defaultPDFConfig.medications,
      ...userConfig?.medications,
    },
    instructions: {
      ...defaultPDFConfig.instructions,
      ...userConfig?.instructions,
    },
    signature: { ...defaultPDFConfig.signature, ...userConfig?.signature },
    footer: { ...defaultPDFConfig.footer, ...userConfig?.footer },
    pageBreak: { ...defaultPDFConfig.pageBreak, ...userConfig?.pageBreak },
    debug: { ...defaultPDFConfig.debug, ...userConfig?.debug },
  };

  const doc = new jsPDF({
    orientation: config.page.orientation,
    unit: config.page.unit,
    format: config.page.format,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Debug: Show borders if enabled
  if (config.debug.showBorders) {
    doc.setDrawColor(255, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(
      config.page.margins.left,
      config.page.margins.top,
      pageWidth - config.page.margins.left - config.page.margins.right,
      pageHeight - config.page.margins.top - config.page.margins.bottom,
      "S"
    );
  }

  let y = config.page.margins.top;

  // ==================== HEADER SECTION ====================

  // Logo
  if (config.logo.enabled) {
    try {
      const response = await fetch(config.logo.url);
      if (response.ok) {
        const blob = await response.blob();
        const logoBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });

        let logoX = config.page.margins.left;
        switch (config.logo.position) {
          case "center":
            logoX = (pageWidth - config.logo.width) / 2;
            break;
          case "right":
            logoX = pageWidth - config.logo.width - config.page.margins.right;
            break;
        }

        doc.addImage(
          logoBase64,
          "PNG",
          logoX,
          y,
          config.logo.width,
          config.logo.height
        );
        y += config.logo.height + config.logo.marginBottom;
      }
    } catch (error) {
      console.warn("Could not load logo:", error);
    }
  }

  // Clinic Information
  const centerX = pageWidth / 2;

  // Clinic Name
  if (prescription.clinicName) {
    y = checkPageBreak(doc, y, 50, config);

    doc.setFont(config.typography.defaultFont, "bold");
    doc.setFontSize(config.typography.fontSizes.title);
    doc.setTextColor(...config.colors.primary);
    doc.text(prescription.clinicName, centerX, y, { align: "center" });
  }

  // Doctor Information
  y += config.layout.sectionSpacing;
  y = checkPageBreak(doc, y, 40, config);

  doc.setFont(config.typography.defaultFont, "bold");
  doc.setFontSize(config.typography.fontSizes.subtitle);
  doc.setTextColor(...config.colors.textDark);
  doc.text(prescription.doctorName, centerX, y, { align: "center" });

  // Doctor License Number
  if (prescription.doctorLicenseNumber) {
    y += 18;
    doc.setFont(config.typography.defaultFont, "normal");
    doc.setFontSize(config.typography.fontSizes.small);
    const licenseText = `License: ${prescription.doctorLicenseNumber}`;
    doc.text(licenseText, centerX, y, { align: "center" });
  }

  // Separator Line
  y += config.layout.sectionSpacing;
  doc.setDrawColor(...config.colors.border);
  doc.setLineWidth(1);
  doc.line(
    config.page.margins.left,
    y,
    pageWidth - config.page.margins.right,
    y
  );

  // ==================== PATIENT INFORMATION ====================

  if (config.patientInfo.show) {
    y += config.layout.blockSpacing;
    y = checkPageBreak(doc, y, 100, config);

    const patientBoxWidth =
      pageWidth - config.page.margins.left - config.page.margins.right;
    const patientBoxHeight = 70;

    // Background Box
    doc.setFillColor(...config.colors.bgLight);
    doc.setDrawColor(...config.colors.accent);
    doc.setLineWidth(1);

    if (config.patientInfo.boxStyle === "rounded") {
      doc.roundedRect(
        config.page.margins.left,
        y - 10,
        patientBoxWidth,
        patientBoxHeight,
        config.patientInfo.borderRadius,
        config.patientInfo.borderRadius,
        "FD"
      );
    } else {
      doc.rect(
        config.page.margins.left,
        y - 10,
        patientBoxWidth,
        patientBoxHeight,
        config.patientInfo.boxStyle === "shadow" ? "S" : "FD"
      );
    }

    // Section Title
    doc.setFont(config.typography.defaultFont, "bold");
    doc.setFontSize(config.typography.fontSizes.heading);
    doc.setTextColor(...config.colors.primary);
    doc.text("Patient Information", config.page.margins.left + 20, y + 5);

    // Patient Info Grid
    const patientInfoRows = createPatientInfoRows(prescription, config);
    const columnWidth = patientBoxWidth / config.patientInfo.columns;
    const rowHeight = 16;
    let rowY = y + 25;

    patientInfoRows.forEach((info, index) => {
      const col = index % config.patientInfo.columns;
      const row = Math.floor(index / config.patientInfo.columns);
      const xPos = config.page.margins.left + 10 + col * columnWidth;
      const yPos = rowY + row * rowHeight;

      // Label
      if (config.patientInfo.showLabels) {
        doc.setFont(
          config.typography.defaultFont,
          config.patientInfo.labelStyle
        );
        doc.setFontSize(config.typography.fontSizes.small);
        doc.setTextColor(...config.colors.primary);
        doc.text(info.label, xPos, yPos);
      }

      // Value
      doc.setFont(config.typography.defaultFont, "normal");
      doc.setFontSize(config.typography.fontSizes.small);
      doc.setTextColor(...config.colors.textDark);

      const labelWidth = config.patientInfo.showLabels ? 80 : 0;
      doc.text(info.value, xPos + labelWidth, yPos);
    });

    y += patientBoxHeight + config.layout.blockSpacing;
  }

  // ==================== TWO COLUMN LAYOUT ====================

  let leftColumnX = config.page.margins.left;
  let rightColumnX = config.page.margins.left;
  let leftColumnWidth =
    pageWidth * config.layout.leftColumnWidth - config.page.margins.left;
  let rightColumnWidth =
    pageWidth * config.layout.rightColumnWidth - config.page.margins.right;

  if (config.layout.twoColumn) {
    rightColumnX =
      pageWidth * config.layout.leftColumnWidth + config.layout.columnGap;
    leftColumnWidth =
      pageWidth * config.layout.leftColumnWidth -
      config.page.margins.left -
      config.layout.columnGap / 2;
    rightColumnWidth =
      pageWidth * config.layout.rightColumnWidth -
      config.page.margins.right -
      config.layout.columnGap / 2;

    // Draw vertical separator
    doc.setDrawColor(...config.colors.border);
    doc.setLineWidth(0.5);
    doc.line(
      pageWidth * config.layout.leftColumnWidth,
      y,
      pageWidth * config.layout.leftColumnWidth,
      pageHeight - config.page.margins.bottom
    );
  }

  let yLeft = y + config.layout.blockSpacing;
  let yRight = y + config.layout.blockSpacing;

  // ==================== LEFT COLUMN: CLINICAL HISTORY ====================

  if (config.clinicalHistory.show && config.layout.twoColumn) {
    const sections = [];

    if (
      config.clinicalHistory.sections.labExams &&
      prescription.medicalExams?.length
    ) {
      sections.push({
        type: "list" as const,
        title: "Lab Exams",
        items: prescription.medicalExams,
      });
    }

    if (
      config.clinicalHistory.sections.allergies &&
      prescription.allergies?.length
    ) {
      sections.push({
        type: "list" as const,
        title: "Allergies",
        items: prescription.allergies,
      });
    }

    if (
      config.clinicalHistory.sections.currentMeds &&
      prescription.currentMedications?.length
    ) {
      sections.push({
        type: "list" as const,
        title: "Current Medications",
        items: prescription.currentMedications,
      });
    }

    if (
      config.clinicalHistory.sections.pastMedicalHistory &&
      prescription.pastMedicalHistory
    ) {
      sections.push({
        type: "text" as const,
        title: "Past Medical History",
        content: prescription.pastMedicalHistory,
      });
    }

    if (
      config.clinicalHistory.sections.familyHistory &&
      prescription.familyHistory
    ) {
      sections.push({
        type: "text" as const,
        title: "Family History",
        content: prescription.familyHistory,
      });
    }

    if (
      config.clinicalHistory.sections.socialHistory &&
      prescription.socialHistory
    ) {
      sections.push({
        type: "text" as const,
        title: "Social History",
        content: prescription.socialHistory,
      });
    }

    for (const section of sections) {
      yLeft = checkPageBreak(doc, yLeft, 100, config);
      yLeft = addLeftColumnSection(
        doc,
        section,
        yLeft,
        leftColumnX,
        leftColumnWidth,
        config
      );
    }
  }

  // ==================== RIGHT COLUMN: MAIN CONTENT ====================

  // VITAL SIGNS
  if (config.vitalSigns.show && hasVitalSigns(prescription)) {
    yRight = checkPageBreak(doc, yRight, 100, config);
    yRight = addRightColumnSection(
      doc,
      "vitalSigns",
      yRight,
      rightColumnX,
      rightColumnWidth,
      prescription,
      config
    );
  }

  // CHIEF COMPLAINT
  if (prescription.chiefComplaint) {
    yRight = checkPageBreak(doc, yRight, 50, config);
    yRight = addRightColumnSection(
      doc,
      "chiefComplaint",
      yRight,
      rightColumnX,
      rightColumnWidth,
      prescription,
      config
    );
  }

  // PHYSICAL EXAM
  if (prescription.physicalExam) {
    yRight = checkPageBreak(doc, yRight, 50, config);
    yRight = addRightColumnSection(
      doc,
      "physicalExam",
      yRight,
      rightColumnX,
      rightColumnWidth,
      prescription,
      config
    );
  }

  // MEDICATIONS
  if (config.medications.show) {
    yRight = checkPageBreak(doc, yRight, 100, config);
    yRight = addMedicationsTable(
      doc,
      yRight,
      rightColumnX,
      rightColumnWidth,
      prescription,
      config
    );
  }

  // ADDITIONAL INSTRUCTIONS
  if (config.instructions.show && hasAdditionalInstructions(prescription)) {
    yRight = checkPageBreak(doc, yRight, 100, config);
    yRight = addInstructionsSection(
      doc,
      yRight,
      rightColumnX,
      rightColumnWidth,
      prescription,
      config
    );
  }

  // ==================== SIGNATURE ====================

  if (config.signature.show) {
    const signatureY = Math.max(yLeft, yRight) + config.layout.sectionSpacing;
    addSignature(doc, signatureY, pageWidth, prescription, config);
  }

  // ==================== FOOTER ====================

  if (config.footer.show) {
    addFooter(doc, pageWidth, pageHeight, prescription, config);
  }

  // ==================== SAVE PDF ====================

  const fileName = generateFileName(prescription);
  doc.save(fileName);
}

// ==================== HELPER FUNCTIONS ====================

function createPatientInfoRows(
  prescription: VoicePrescription,
  config: PDFConfig
) {
  const rows = [];
  const fields = config.patientInfo.include;

  const fieldMap: Record<string, { label: string; value: string }> = {
    name: {
      label: "Name",
      value: prescription.patientName || "N/A",
    },
    age: {
      label: "Age",
      value: prescription.patientAge
        ? `${prescription.patientAge} years`
        : "N/A",
    },
    gender: {
      label: "Gender",
      value: prescription.patientGender || "N/A",
    },
    date: {
      label: "Date",
      value: prescription.date
        ? format(new Date(prescription.date), "yyyy/MM/dd")
        : format(new Date(), "yyyy/MM/dd"),
    },
    weight: {
      label: "Weight",
      value: prescription.weight ? `${prescription.weight} kg` : "N/A",
    },
    height: {
      label: "Height",
      value: prescription.height ? `${prescription.height} cm` : "N/A",
    },
    bmi: {
      label: "BMI",
      value: prescription.bmi || "N/A",
    },
    phone: {
      label: "Phone",
      value: prescription.patientPhone || "N/A",
    },
    address: {
      label: "Address",
      value: prescription.patientAddress || "N/A",
    },
  };

  for (const field of fields) {
    if (fieldMap[field]) {
      rows.push({
        label: fieldMap[field].label,
        value: fieldMap[field].value,
      });
    }
  }

  return rows;
}

function addLeftColumnSection(
  doc: jsPDF,
  section: any,
  y: number,
  x: number,
  width: number,
  config: PDFConfig
): number {
  // Section header
  doc.setFont(config.typography.defaultFont, "bold");
  doc.setFontSize(config.typography.fontSizes.subheading);
  doc.setTextColor(...config.colors.primary);
  doc.text(section.title, x, y);

  y += config.layout.blockSpacing;

  // Content box
  const boxHeight =
    section.type === "list"
      ? Math.max(
          config.clinicalHistory.boxHeight,
          section.items.length * 15 + 20
        )
      : config.clinicalHistory.boxHeight;

  doc.setFillColor(...config.colors.bgLight);
  doc.setDrawColor(...config.colors.border);
  doc.setLineWidth(0.5);

  if (config.clinicalHistory.boxStyle === "rounded") {
    doc.roundedRect(x, y - 5, width, boxHeight, 3, 3, "FD");
  } else {
    doc.rect(x, y - 5, width, boxHeight, "FD");
  }

  // Content
  if (section.type === "list") {
    doc.setFont(config.typography.defaultFont, "normal");
    doc.setFontSize(config.typography.fontSizes.small);
    doc.setTextColor(...config.colors.textDark);

    section.items.forEach((item: string, index: number) => {
      const itemText = `${index + 1}. ${item}`;
      doc.text(itemText, x + 10, y + 8 + index * 15);
    });
  } else {
    const contentLines = doc.splitTextToSize(section.content, width - 20);
    doc.setFont(config.typography.defaultFont, "normal");
    doc.setFontSize(config.typography.fontSizes.small);
    doc.setTextColor(...config.colors.textDark);
    doc.text(contentLines, x + 10, y + 8);
  }

  y += boxHeight + config.layout.blockSpacing;
  return y;
}

function addRightColumnSection(
  doc: jsPDF,
  sectionType: string,
  y: number,
  x: number,
  width: number,
  prescription: VoicePrescription,
  config: PDFConfig
): number {
  const sectionTitles = {
    vitalSigns: "Vital Signs",
    chiefComplaint: "Chief Complaint",
    physicalExam: "Physical Examination",
  };

  const title = sectionTitles[sectionType as keyof typeof sectionTitles];

  // Section header
  doc.setFillColor(...config.colors.accent);
  doc.rect(x, y - 8, 5, 22, "F");

  doc.setFont(config.typography.defaultFont, "bold");
  doc.setFontSize(config.typography.fontSizes.heading);
  doc.setTextColor(...config.colors.primary);
  doc.text(title, x + 15, y + 5);

  y += 25;

  // Section content
  switch (sectionType) {
    case "vitalSigns":
      y = addVitalSignsGrid(doc, y, x, width, prescription, config);
      break;
    case "chiefComplaint":
      y = addTextContent(
        doc,
        y,
        x,
        width,
        prescription.chiefComplaint!,
        config
      );
      break;
    case "physicalExam":
      y = addTextContent(doc, y, x, width, prescription.physicalExam!, config);
      break;
  }

  return y;
}

function addVitalSignsGrid(
  doc: jsPDF,
  y: number,
  x: number,
  width: number,
  prescription: VoicePrescription,
  config: PDFConfig
): number {
  const vitalSigns = [
    {
      key: "pulse",
      label: "Pulse Rate",
      value: prescription.pulseRate,
      unit: "bpm",
    },
    {
      key: "bp",
      label: "Blood Pressure",
      value: prescription.bloodPressure,
      unit: "",
    },
    {
      key: "heart",
      label: "Heart Rate",
      value: prescription.heartRate,
      unit: "bpm",
    },
    {
      key: "temp",
      label: "Temperature",
      value: prescription.temperature,
      unit: "°C",
    },
    {
      key: "respiratory",
      label: "Respiratory Rate",
      value: prescription.respiratoryRate,
      unit: "/min",
    },
    {
      key: "oxygen",
      label: "Oxygen Saturation",
      value: prescription.oxygenSaturation,
      unit: "%",
    },
  ];

  const filteredVitals = vitalSigns.filter(
    (vital) => config.vitalSigns.include.includes(vital.key) && vital.value
  );

  const startX = x + 10;
  const startY = y;
  const cellWidth = config.vitalSigns.cell.width;
  const cellHeight = config.vitalSigns.cell.height;
  const gap = config.vitalSigns.cell.gap;
  const columns = config.vitalSigns.gridColumns;

  filteredVitals.forEach((vital, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const cellX = startX + col * (cellWidth + gap);
    const cellY = startY + row * (cellHeight + gap);

    // Cell background
    doc.setFillColor(250, 250, 250);
    if (config.vitalSigns.cell.borderRadius > 0) {
      doc.roundedRect(
        cellX,
        cellY,
        cellWidth,
        cellHeight,
        config.vitalSigns.cell.borderRadius,
        config.vitalSigns.cell.borderRadius,
        "F"
      );
    } else {
      doc.rect(cellX, cellY, cellWidth, cellHeight, "F");
    }

    doc.setDrawColor(...config.colors.border);
    doc.setLineWidth(0.5);
    doc.rect(cellX, cellY, cellWidth, cellHeight, "S");

    // Label
    doc.setFont(config.typography.defaultFont, "bold");
    doc.setFontSize(9);
    doc.setTextColor(...config.colors.primary);
    doc.text(vital.label, cellX + 5, cellY + 12);

    // Value
    const valueText = config.vitalSigns.showUnits
      ? `${vital.value} ${vital.unit}`.trim()
      : vital.value!;

    doc.setFont(config.typography.defaultFont, "normal");
    doc.setFontSize(10);
    doc.setTextColor(...config.colors.textDark);

    const valueWidth = doc.getTextWidth(valueText);
    const centeredX = cellX + (cellWidth - valueWidth) / 2;
    doc.text(valueText, Math.max(centeredX, cellX + 5), cellY + 25);
  });

  const rows = Math.ceil(filteredVitals.length / columns);
  y += rows * (cellHeight + gap) + 10;
  return y;
}

function addTextContent(
  doc: jsPDF,
  y: number,
  x: number,
  width: number,
  text: string,
  config: PDFConfig
): number {
  const lines = doc.splitTextToSize(text, width - 20);

  doc.setFont(config.typography.defaultFont, "normal");
  doc.setFontSize(config.typography.fontSizes.body);
  doc.setTextColor(...config.colors.textDark);
  doc.text(lines, x + 10, y);

  y += lines.length * 12 + 20;
  return y;
}

function addMedicationsTable(
  doc: jsPDF,
  y: number,
  x: number,
  width: number,
  prescription: VoicePrescription,
  config: PDFConfig
): number {
  // Section header
  doc.setFillColor(...config.colors.accent);
  doc.rect(x, y - 8, 5, 22, "F");

  doc.setFont(config.typography.defaultFont, "bold");
  doc.setFontSize(config.typography.fontSizes.heading);
  doc.setTextColor(...config.colors.primary);
  doc.text("Prescribed Medications", x + 15, y + 5);

  y += 25;

  const medications = prescription.medicines || [];
  if (medications.length === 0) {
    doc.setFont(config.typography.defaultFont, "normal");
    doc.setFontSize(config.typography.fontSizes.body);
    doc.setTextColor(...config.colors.textDark);
    doc.text("No medications prescribed.", x + 12, y);

    y += 20;
    return y;
  }

  // Create headers
  const headers = config.medications.table.headers;
  const columnWidths = config.medications.table.columnWidths;

  doc.setFont(config.typography.defaultFont, "bold");
  doc.setFontSize(config.typography.fontSizes.small);
  doc.setTextColor(...config.colors.primary);

  let xPos = x + 10;
  headers.forEach((header, index) => {
    const padding = index === 0 ? 2 : 8;
    doc.text(header, xPos + padding, y, {
      maxWidth: columnWidths[index] - padding * 2,
    });
    xPos += columnWidths[index];
  });

  // Header separator
  y += 5;
  doc.setDrawColor(...config.colors.border);
  doc.setLineWidth(0.5);
  doc.line(x + 10, y, x + width, y);
  y += 10;

  // Medication rows
  medications.forEach((med, index) => {
    y = checkPageBreak(doc, y, config.medications.table.rowHeight + 30, config);

    if (config.pageBreak.repeatHeaders && y === config.page.margins.top) {
      // Re-add headers on new page
      doc.setFont(config.typography.defaultFont, "bold");
      doc.setFontSize(config.typography.fontSizes.small);
      doc.setTextColor(...config.colors.primary);

      let xPos = x + 10;
      headers.forEach((header, i) => {
        const padding = i === 0 ? 2 : 8;
        doc.text(header, xPos + padding, y - 20, {
          maxWidth: columnWidths[i] - padding * 2,
        });
        xPos += columnWidths[i];
      });

      y += 5;
      doc.line(x + 10, y, x + width, y);
      y += 10;
    }

    // Row background
    if (config.medications.table.stripedRows && index % 2 === 0) {
      doc.setFillColor(...config.colors.tableStriped);
      doc.rect(
        x + 10,
        y - 8,
        width - 20,
        config.medications.table.rowHeight,
        "F"
      );
    }

    // Row data
    const rowData = [
      config.medications.table.showRowNumbers ? `${index + 1}.` : "",
      med.medicine || "N/A",
      med.dosage || "N/A",
      med.frequency || "N/A",
      med.duration || "N/A",
      med.instructions || "N/A",
    ];

    xPos = x + 10;
    doc.setFont(config.typography.defaultFont, "normal");
    doc.setFontSize(config.typography.fontSizes.small);
    doc.setTextColor(...config.colors.textDark);

    rowData.forEach((data, colIndex) => {
      const padding = colIndex === 0 ? 2 : 8;
      doc.text(data, xPos + padding, y, {
        maxWidth: columnWidths[colIndex] - padding * 2,
      });
      xPos += columnWidths[colIndex];
    });

    y += config.medications.table.rowHeight;

    // Additional details
    if (config.medications.table.showAdditionalDetails) {
      const details = [];
      if (med.form) details.push(`Form: ${med.form}`);
      if (med.route) details.push(`Route: ${med.route}`);
      if (med.timing) details.push(`Timing: ${med.timing}`);
      if (med.notes) details.push(`Notes: ${med.notes}`);

      if (details.length > 0) {
        const detailsText = details.join(" | ");

        doc.setFont(config.typography.defaultFont, "italic");
        doc.setFontSize(config.typography.fontSizes.tiny);
        doc.setTextColor(120, 120, 120);
        doc.text(detailsText, x + 45, y, { maxWidth: width - 55 });

        y += 12;
      }
    }

    y += 5;
  });

  return y;
}

function addInstructionsSection(
  doc: jsPDF,
  y: number,
  x: number,
  width: number,
  prescription: VoicePrescription,
  config: PDFConfig
): number {
  // Section header
  doc.setFillColor(...config.colors.accent);
  doc.rect(x, y - 8, 5, 22, "F");

  doc.setFont(config.typography.defaultFont, "bold");
  doc.setFontSize(config.typography.fontSizes.heading);
  doc.setTextColor(...config.colors.primary);
  doc.text("Additional Instructions", x + 15, y + 5);

  y += 25;

  // General Instructions
  if (config.instructions.sections.general && prescription.instructions) {
    doc.setFont(config.typography.defaultFont, "bold");
    doc.setFontSize(config.typography.fontSizes.subheading);
    doc.setTextColor(...config.colors.primary);
    doc.text("General Instructions", x + 10, y);

    y = addTextContent(
      doc,
      y + config.layout.lineSpacing,
      x + config.instructions.indent,
      width - config.instructions.indent,
      prescription.instructions,
      config
    );
    y += 10;
  }

  // Follow-up
  if (config.instructions.sections.followUp && prescription.followUp) {
    doc.setFont(config.typography.defaultFont, "bold");
    doc.setFontSize(config.typography.fontSizes.subheading);
    doc.setTextColor(...config.colors.primary);
    doc.text("Follow-up", x + 10, y);

    y = addTextContent(
      doc,
      y + config.layout.lineSpacing,
      x + config.instructions.indent,
      width - config.instructions.indent,
      prescription.followUp,
      config
    );
    y += 10;
  }

  // Restrictions
  if (config.instructions.sections.restrictions && prescription.restrictions) {
    doc.setFont(config.typography.defaultFont, "bold");
    doc.setFontSize(config.typography.fontSizes.subheading);
    doc.setTextColor(...config.colors.primary);
    doc.text("Restrictions", x + 10, y);

    y = addTextContent(
      doc,
      y + config.layout.lineSpacing,
      x + config.instructions.indent,
      width - config.instructions.indent,
      prescription.restrictions,
      config
    );
  }

  return y;
}

function addSignature(
  doc: jsPDF,
  y: number,
  pageWidth: number,
  prescription: VoicePrescription,
  config: PDFConfig
) {
  let signatureX;
  switch (config.signature.position) {
    case "left":
      signatureX = config.page.margins.left;
      break;
    case "center":
      signatureX = (pageWidth - config.signature.lineLength) / 2;
      break;
    case "right":
      signatureX =
        pageWidth - config.page.margins.right - config.signature.lineLength;
      break;
    default:
      signatureX =
        pageWidth - config.page.margins.right - config.signature.lineLength;
  }

  // Signature line
  doc.setDrawColor(...config.colors.textDark);
  doc.setLineWidth(config.signature.lineWidth);
  doc.line(signatureX, y, signatureX + config.signature.lineLength, y);

  // Doctor name
  doc.setFont(config.typography.defaultFont, "bold");
  doc.setFontSize(config.typography.fontSizes.subheading);
  doc.setTextColor(...config.colors.primary);
  doc.text(
    prescription.doctorName,
    signatureX + config.signature.lineLength / 2,
    y + 20,
    { align: "center" }
  );

  // Title
  if (config.signature.includeTitle) {
    doc.setFont(config.typography.defaultFont, "normal");
    doc.setFontSize(config.typography.fontSizes.body);
    doc.setTextColor(...config.colors.textDark);
    doc.text(
      "Medical Practitioner",
      signatureX + config.signature.lineLength / 2,
      y + 35,
      { align: "center" }
    );
  }
}

function addFooter(
  doc: jsPDF,
  pageWidth: number,
  pageHeight: number,
  prescription: VoicePrescription,
  config: PDFConfig
) {
  const footerY = pageHeight - config.footer.height;

  // Prescription ID
  if (config.footer.showPrescriptionId) {
    doc.setFont(config.typography.defaultFont, "normal");
    doc.setFontSize(config.typography.fontSizes.tiny);
    doc.setTextColor(120, 120, 120);
    const idText = `Prescription ID: ${prescription._id}`;
    doc.text(idText, config.page.margins.left, footerY);
  }

  // Page numbers
  if (config.footer.showPageNumbers) {
    const pageText = `Page 1 of 1`;
    doc.text(pageText, pageWidth - config.page.margins.right, footerY, {
      align: "right",
    });
  }

  // Digital note
  if (config.footer.showDigitalNote) {
    doc.text(
      "This is a digitally generated prescription.",
      pageWidth / 2,
      footerY + 15,
      { align: "center" }
    );
  }
}

function generateFileName(prescription: VoicePrescription): string {
  const prescriptionDate = prescription.date
    ? new Date(prescription.date)
    : new Date();
  const formattedDate = format(prescriptionDate, "yyyy-MM-dd");
  return `prescription-${prescription.patientName
    .toLowerCase()
    .replace(/\s+/g, "-")}-${formattedDate}.pdf`;
}

function hasVitalSigns(prescription: VoicePrescription): boolean {
  return [
    prescription.pulseRate,
    prescription.bloodPressure,
    prescription.heartRate,
    prescription.temperature,
    prescription.respiratoryRate,
    prescription.oxygenSaturation,
  ].some((v) => v && v.trim() !== "");
}

function hasAdditionalInstructions(prescription: VoicePrescription): boolean {
  return !!(
    (prescription.instructions && prescription.instructions.trim() !== "") ||
    (prescription.followUp && prescription.followUp.trim() !== "") ||
    (prescription.restrictions && prescription.restrictions.trim() !== "")
  );
}

// Export with the expected name for backward compatibility
export const downloadPrescriptionPDF = generatePrescriptionPDF;

// ==================== USAGE EXAMPLES ====================

/*
Example 1: English prescription
generatePrescriptionPDF(prescriptionData);
*/
