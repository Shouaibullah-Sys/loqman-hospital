// types/prescription.ts
export interface FormMedicine {
  id: string;
  medicine: string;
  dosage: string;
  form?: string;
  frequency: string;
  duration: string;
  route?: string;
  timing?: string;
  withFood?: boolean;
  instructions?: string;
  notes?: string;
  prescriptionId: string;
}

export interface Prescription {
  id: string;
  title?: string;
  patientName: string;
  patientAge?: string;
  patientGender?: string;
  patientPhone?: string;
  patientAddress?: string;
  diagnosis: string;
  prescription: FormMedicine[];
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  physicalExamination?: string;
  differentialDiagnosis?: string;
  pulseRate?: string;
  bloodPressure?: string;
  temperature?: string;
  respiratoryRate?: string;
  oxygenSaturation?: string;
  allergies: string[];
  currentMedications: string[];
  pastMedicalHistory?: string;
  familyHistory?: string;
  socialHistory?: string;
  instructions?: string;
  followUp?: string;
  restrictions?: string;
  doctorName?: string;
  doctorLicenseNumber?: string;
  clinicName?: string;
  clinicAddress?: string;
  doctorFree?: string; // Doctor free amount/charge
  prescriptionDate: string;
  prescriptionNumber?: string;
  source?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  aiConfidence?: string;
  aiModelUsed?: string;
  processingTime?: number;
  rawAiResponse?: any;
}

export interface AutocompleteResponse {
  suggestions: string[];
}

export interface AIAnalysis {
  diagnosis: string;
  confidence: string;
  medications: FormMedicine[];
  clinicalNotes: string;
  differentialDiagnosis: string;
  recommendations: string[];
  warnings: string[];
  aiModelUsed?: string;
}
