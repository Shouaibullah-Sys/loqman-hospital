// services/huggingfaceService.ts
import { HfInference } from "@huggingface/inference";

const hf = process.env.HUGGING_FACE_API_KEY
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
      console.warn("Hugging Face API not configured, using local analysis");
      return this.generateLocalAnalysis(symptoms, patientHistory);
    }

    try {
      const prompt = this.buildMedicalPrompt(symptoms, patientHistory);

      // Try models in order
      for (const model of Object.values(MEDICAL_MODELS)) {
        try {
          const response = await this.tryModel(model, prompt);
          if (response.success && response.text) {
            // Added null check for response.text
            return this.parseMedicalResponse(response.text, model);
          }
        } catch (error) {
          console.warn(`Model ${model} failed:`, error);
          continue;
        }
      }

      // All models failed
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
      recommendations: ["معاینه فیزیکی کامل", "پایش علائم حیاتی"],
      warnings: ["این تحلیل جایگزین معاینه پزشک نمی‌شود"],
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
    return {
      diagnosis: "نیازمند معاینه حضوری",
      confidence: "low",
      clinicalNotes: `علائم گزارش شده: ${symptoms}. ${
        patientHistory ? `تاریخچه: ${patientHistory}` : ""
      }`,
      differentialDiagnosis: "عفونت ویروسی، باکتریال، یا سایر موارد",
      medications: [],
      recommendations: [
        "معاینه فیزیکی کامل",
        "پایش علائم حیاتی",
        "آزمایشات پاراکلینیک در صورت نیاز",
      ],
      warnings: [
        "این تحلیل پایه است و جایگزین معاینه پزشک نمی‌شود",
        "در صورت تشدید علائم فوراً مراجعه کنید",
      ],
      aiModelUsed: "local_fallback",
    };
  }
}
