// utils/validation.ts

interface ValidationResult {
  isValid: boolean;
  message: string;
}

export function validateInput(text: string): ValidationResult {
  if (!text || text.trim().length === 0) {
    return {
      isValid: false,
      message: "لطفاً علائم بیمار یا متن نسخه را وارد کنید",
    };
  }

  if (text.trim().length < 5) {
    return {
      isValid: false,
      message: "متن وارد شده بسیار کوتاه است",
    };
  }

  return {
    isValid: true,
    message: "",
  };
}

export function validatePrescription(prescription: any): ValidationResult {
  const requiredFields = ["patient", "diagnosis", "prescription"];
  const missingFields = requiredFields.filter((field) => !prescription[field]);

  if (missingFields.length > 0) {
    return {
      isValid: false,
      message: `فیلدهای ضروری وجود ندارد: ${missingFields.join(", ")}`,
    };
  }

  if (
    !Array.isArray(prescription.prescription) ||
    prescription.prescription.length === 0
  ) {
    return {
      isValid: false,
      message: "نسخه باید حداقل یک دارو داشته باشد",
    };
  }

  for (const med of prescription.prescription) {
    const medRequired = ["medicine", "dose", "frequency", "duration"];
    const medMissing = medRequired.filter((field) => !med[field]);

    if (medMissing.length > 0) {
      return {
        isValid: false,
        message: `اطلاعات ناقص برای دارو: ${medMissing.join(", ")}`,
      };
    }
  }

  return {
    isValid: true,
    message: "",
  };
}
