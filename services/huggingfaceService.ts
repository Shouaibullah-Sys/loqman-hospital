// services/huggingfaceService.ts
import { HfInference } from "@huggingface/inference";

// Only initialize HuggingFace if API key is properly configured
const hf =
  process.env.HUGGING_FACE_API_KEY && process.env.HUGGING_FACE_API_KEY.trim()
    ? new HfInference(process.env.HUGGING_FACE_API_KEY)
    : null;

// Updated medical models with better fallbacks
const MEDICAL_MODELS = {
  primary: "microsoft/BioGPT-Large",
  secondary: "microsoft/DialoGPT-large",
  fallback: "gpt2",
};

export class MedicalAIService {
  static async analyzeSymptoms(
    symptoms: string,
    patientHistory: string = ""
  ): Promise<any> {
    // Check if Hugging Face is available
    if (!hf) {
      console.log("Hugging Face API not configured, using local analysis");
      return this.generateLocalAnalysis(symptoms, patientHistory);
    }

    try {
      const prompt = this.buildMedicalPrompt(symptoms, patientHistory);

      // Try models in order
      for (const [modelName, model] of Object.entries(MEDICAL_MODELS)) {
        try {
          console.log(`Trying model: ${model}`);
          const response = await this.tryModel(model, prompt);
          if (response.success && response.text) {
            console.log(`Model ${model} succeeded`);
            return this.parseMedicalResponse(response.text, model);
          }
        } catch (error) {
          console.warn(`Model ${model} failed:`, error);
          continue;
        }
      }

      // All models failed
      console.log("All AI models failed, using local analysis");
      return this.generateLocalAnalysis(symptoms, patientHistory);
    } catch (error) {
      console.error("All AI models failed:", error);
      return this.generateLocalAnalysis(symptoms, patientHistory);
    }
  }

  private static async tryModel(
    model: string,
    prompt: string
  ): Promise<{
    success: boolean;
    text?: string;
    error?: string;
    model: string;
  }> {
    try {
      const response = await hf!.textGeneration({
        model,
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.3,
          do_sample: false,
        },
      });

      return {
        success: true,
        text: response.generated_text,
        model,
      };
    } catch (error: any) {
      console.error(`Model ${model} error:`, error.message);
      return {
        success: false,
        error: error.message,
        model,
      };
    }
  }

  private static buildMedicalPrompt(
    symptoms: string,
    patientHistory: string
  ): string {
    return `As a medical doctor, analyze these symptoms and provide a professional assessment in Persian:

Symptoms: ${symptoms}
Medical History: ${patientHistory || "None provided"}

Please provide:
1. Potential diagnoses
2. Recommended examinations
3. Initial management
4. Important warnings

Response in Persian:`;
  }

  private static parseMedicalResponse(text: string, model: string) {
    return {
      diagnosis: this.extractDiagnosis(text),
      confidence: "medium",
      clinicalNotes: text.slice(0, 300) + "...",
      differentialDiagnosis: "نیازمند معاینه بالینی",
      medications: [],
      recommendations: ["Complete physical examination", "Monitor vital signs"],
      warnings: ["This analysis does not replace medical examination"],
      aiModelUsed: model,
    };
  }

  private static extractDiagnosis(text: string): string {
    // Simple keyword-based diagnosis extraction
    const conditions: { [key: string]: string } = {
      سرفه: "عفونت تنفسی",
      تب: "عفونت ویروسی",
      گلودرد: "فارنژیت",
      سردرد: "سردرد تنشی",
      "درد معده": "گاستریت",
      اسهال: "گاستروانتریت",
    };

    for (const [keyword, diagnosis] of Object.entries(conditions)) {
      if (text.includes(keyword)) {
        return diagnosis;
      }
    }

    return "نیازمند ارزیابی بیشتر";
  }

  private static generateLocalAnalysis(
    symptoms: string,
    patientHistory: string
  ) {
    // Enhanced local analysis with better diagnosis matching
    const symptomLower = symptoms.toLowerCase();
    let diagnosis = "نیازمند معاینه حضوری";
    let recommendations = [
      "Complete physical examination",
      "Monitor vital signs",
      "Paraclinical tests if needed",
    ];
    let warnings = [
      "This is a basic analysis and does not replace medical examination",
      "Seek immediate medical attention if symptoms worsen",
    ];

    // Pattern matching for common conditions
    if (symptomLower.includes("سرفه") || symptomLower.includes("cough")) {
      diagnosis = "عفونت تنفسی فوقانی";
      recommendations = [
        "بررسی ریه و مجاری تنفسی",
        "آزمایش خون و عکس قفسه سینه در صورت نیاز",
        "استراحت و مصرف مایعات فراوان",
      ];
    } else if (symptomLower.includes("تب") || symptomLower.includes("fever")) {
      diagnosis = "سندرم تب‌دار";
      recommendations = [
        "کنترل دمای بدن",
        "بررسی علل عفونی",
        "آزمایش‌های اولیه در صورت نیاز",
      ];
    } else if (
      symptomLower.includes("سردرد") ||
      symptomLower.includes("headache")
    ) {
      diagnosis = "سردرد تنشی";
      recommendations = [
        "بررسی علل ثانویه سردرد",
        "کنترل فشار خون",
        "در صورت تداوم، سی‌تی‌اسکن مغز",
      ];
    } else if (
      symptomLower.includes("درد معده") ||
      symptomLower.includes("stomach pain")
    ) {
      diagnosis = "گاستریت یا سوءهاضمه";
      recommendations = [
        "معاینه شکم",
        "آزمایش هلیکوباکتر در صورت نیاز",
        "رژیم غذایی مناسب",
      ];
    }

    return {
      diagnosis,
      confidence: "low",
      clinicalNotes: `علائم گزارش شده: ${symptoms}. ${
        patientHistory ? `تاریخچه: ${patientHistory}` : ""
      }`,
      differentialDiagnosis:
        diagnosis === "نیازمند معاینه حضوری"
          ? "نیازمند ارزیابی بالینی دقیق"
          : "تشخیص افتراقی نیازمند بررسی بیشتر",
      medications: [],
      recommendations,
      warnings,
      aiModelUsed: "local_fallback",
    };
  }
}
