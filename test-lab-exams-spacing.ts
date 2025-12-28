// test-lab-exams-spacing.ts - Test Lab Exams spacing improvements

import { generatePrescriptionPDF } from "./utils/generatePrescriptionPDF";
import { VoicePrescription } from "./utils/generatePrescriptionPDF";

// Test data with many long lab exams to test spacing
const testPrescription: VoicePrescription = {
  _id: "test-lab-spacing-001",
  patientName: "John Doe",
  patientAge: "45",
  patientGender: "Male",
  patientAddress: "123 Main St, Anytown, USA",
  date: "2025-12-28",
  doctorName: "Dr. Jane Smith",
  doctorLicenseNumber: "MD123456",
  clinicName: "Medical Clinic",
  clinicAddress: "456 Health Ave, Medical City",

  // Extensive lab exams list to test spacing
  medicalExams: [
    "Complete Blood Count (CBC) with Differential",
    "Comprehensive Metabolic Panel (CMP) including Electrolytes",
    "Lipid Profile - Total Cholesterol, HDL, LDL, Triglycerides",
    "Thyroid Function Tests - TSH, T3, T4, Free T4",
    "HbA1c - Glycated Hemoglobin for Diabetes Monitoring",
    "Liver Function Tests - ALT, AST, Bilirubin, Alkaline Phosphatase",
    "Kidney Function Tests - BUN, Creatinine, eGFR",
    "Uric Acid Level for Gout Assessment",
    "Vitamin D 25-Hydroxy for Bone Health",
    "Vitamin B12 and Folate Levels",
    "C-Reactive Protein (CRP) for Inflammation",
    "Erythrocyte Sedimentation Rate (ESR)",
    "Prostate Specific Antigen (PSA) for Men",
    "Mammography and Breast Ultrasound for Women",
    "Chest X-Ray for Pulmonary Assessment",
    "ECG for Cardiac Function Evaluation",
  ],

  // Additional test data
  allergies: ["Penicillin", "Shellfish"],
  currentMedications: ["Lisinopril 10mg", "Metformin 500mg"],
  weight: "75",
  height: "175",
  pulseRate: "72",
  bloodPressure: "120/80",
  heartRate: "72",
  temperature: "98.6",
  respiratoryRate: "16",
  oxygenSaturation: "98%",

  medicines: [
    {
      medicine: "Amoxicillin",
      dosage: "500mg",
      frequency: "Three times daily",
      duration: "7 days",
      instructions: "Take with food",
      form: "Capsule",
      route: "Oral",
      timing: "After meals",
      withFood: true,
    },
  ],

  chiefComplaint: "Annual check-up and lab work review",
  physicalExam: "Patient appears well, no acute distress",
  followUp: "Return in 3 months for follow-up",
  followUpPersian: "سه ماه بعد برای پیگیری مراجعه کنید",
  restrictions: "Avoid heavy lifting for 48 hours",
  restrictionsPersian: "به مدت ۴۸ ساعت از بلند کردن اجسام سنگین خودداری کنید",
  instructions: "Continue current medications and healthy lifestyle",
  instructionsPersian: "داروهای فعلی و سبک زندگی سالم را ادامه دهید",
};

// Test function
export async function testLabExamsSpacing() {
  console.log("Testing Lab Exams spacing improvements...");
  console.log(
    "Number of lab exams:",
    testPrescription.medicalExams?.length || 0
  );

  try {
    await generatePrescriptionPDF(testPrescription);
    console.log("✅ Lab Exams spacing test completed successfully!");
    console.log(
      "Check the generated PDF to verify Lab Exams section has adequate spacing."
    );
  } catch (error) {
    console.error("❌ Lab Exams spacing test failed:", error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testLabExamsSpacing();
}
