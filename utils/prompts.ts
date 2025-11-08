// utils/prompts.ts
export function getAutocompletePrompt(inputText: string): string {
  return `Complete the following medical symptom or condition in Persian/Dari. Provide 5 relevant suggestions based on common medical terminology:

Input: "${inputText}"

Suggestions should be medical terms related to symptoms, conditions, or medications. Focus on Persian/Dari medical vocabulary.`;
}

export function getPrescriptionPrompt(inputText: string, drugs: any): string {
  const commonMeds = drugs.commonMedicines
    .slice(0, 15)
    .map(
      (med: any) => `${med.name} ${med.dosage} (${med.form}) - ${med.commonUse}`
    )
    .join(", ");

  return `You are an experienced medical doctor. Generate a comprehensive medical prescription in JSON format based on the patient description. Follow this exact structure:

{
  "patientName": "Patient full name in Persian",
  "patientAge": "Age with unit",
  "patientGender": "مرد or زن",
  "chiefComplaint": "Main complaint in Persian",
  "historyOfPresentIllness": "Detailed history in Persian",
  "physicalExamination": "Examination findings in Persian",
  "diagnosis": "Primary diagnosis in Persian",
  "differentialDiagnosis": "Other possibilities in Persian",
  "prescription": [
    {
      "medicine": "Medicine name in English",
      "dosage": "Dosage in English",  // CHANGED FROM 'dose' to 'dosage'
      "form": "tablet/capsule/syrup/injection",
      "frequency": "Usage frequency in Persian",
      "duration": "Treatment duration in Persian",
      "route": "oral/topical/injection/inhalation",
      "timing": "before_meal/after_meal/with_meal/empty_stomach/anytime",
      "withFood": boolean,
      "instructions": "Specific instructions in Persian",
      "notes": "Clinical notes in Persian"
    }
  ],
  "instructions": "General instructions in Persian",
  "followUp": "Follow-up advice in Persian",
  "restrictions": "Activity restrictions in Persian"
}

Available common medicines: ${commonMeds}

Important rules:
- Medicine names and dosages must be in English
- All other fields must be in Persian/Dari
- Use appropriate medicines for the condition
- Include reasonable dosage, duration, and instructions
- Consider patient age and condition severity

Input: ${inputText}
Output:`;
}
