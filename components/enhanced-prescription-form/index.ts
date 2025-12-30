// Enhanced Prescription Form - Index file for easy imports

// Main component export
export { EnhancedPrescriptionForm } from "./EnhancedPrescriptionForm";

// Individual component exports (for advanced use cases)
export { HeaderComponent } from "./Header";
export { PatientInformation } from "./PatientInformation";
export { MedicalHistory } from "./MedicalHistory";
export { VitalSigns } from "./VitalSigns";
export { SystemExaminations } from "./SystemExaminations";
export { MedicalTests } from "./MedicalTests";
export { DoctorInfo } from "./DoctorInfo";
export { MedicationsTable } from "./MedicationsTable";
export { Footer } from "./Footer";

// Constants and utilities
export * from "./constants";

// Legacy re-export for backward compatibility
// This ensures existing imports continue to work
export { EnhancedPrescriptionForm as default } from "./EnhancedPrescriptionForm";
