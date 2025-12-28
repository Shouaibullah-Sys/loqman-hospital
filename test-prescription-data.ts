// Test data to demonstrate the PDF generation fixes
import { VoicePrescription } from "./utils/generatePrescriptionPDF";

// Test case 1: Empty physical exam string (user's original issue)
export const testPrescriptionWithEmptyPhysicalExam: VoicePrescription = {
  _id: "test-123",
  patientName: "John Doe",
  patientAge: "35",
  patientGender: "Male",
  patientPhone: "555-0123",
  patientAddress: "123 Main St",
  allergies: ["Penicillin"],
  currentMedications: ["Aspirin 81mg"],
  pastMedicalHistory: "Hypertension",
  familyHistory: "Diabetes in mother",
  socialHistory: "Non-smoker",
  chiefComplaint: "Headache and fatigue",
  weight: "70",
  height: "175",
  pulseRate: "72",
  heartRate: "72",
  bloodPressure: "120/80",
  temperature: "36.5",
  respiratoryRate: "16",
  oxygenSaturation: "98",
  physicalExam: "", // Empty string - should now show in PDF
  medicalExams: ["Complete Blood Count (CBC)", "Lipid Profile"], // Should show in PDF
  examNotes: "Fasting required for lipid profile",
  medicines: [
    {
      medicine: "Paracetamol",
      dosage: "500mg",
      frequency: "Twice daily",
      duration: "5 days",
      instructions: "Take after meals",
    },
  ],
  instructions: "Rest and stay hydrated",
  followUp: "Return if symptoms worsen",
  restrictions: "Avoid alcohol",
  doctorName: "Dr. Sarah Smith",
  doctorLicenseNumber: "MD12345",
  clinicName: "City Medical Center",
  clinicAddress: "456 Health Ave",
  date: new Date().toISOString(),
  source: "test",
  status: "active",
};

// Test case 2: Medical exams with empty array
export const testPrescriptionWithEmptyMedicalExams: VoicePrescription = {
  ...testPrescriptionWithEmptyPhysicalExam,
  _id: "test-124",
  medicalExams: [], // Empty array
  examNotes: "", // Empty string
};

// Test case 3: Only medical exams, no physical exam
export const testPrescriptionWithOnlyMedicalExams: VoicePrescription = {
  ...testPrescriptionWithEmptyPhysicalExam,
  _id: "test-125",
  physicalExam: undefined, // undefined
  medicalExams: ["MRI Brain", "EEG"], // Should show
};
