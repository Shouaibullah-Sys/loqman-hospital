import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { MedicalAIService } from "@/services/huggingfaceService";
import { MedicationService } from "@/services/medicationService";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
    }

    const { symptoms, patientHistory, currentDiagnosis } = await request.json();

    if (!symptoms?.trim()) {
      return NextResponse.json(
        { error: "علائم بیمار الزامی است" },
        { status: 400 }
      );
    }

    const analysis = await MedicalAIService.analyzeSymptoms(
      symptoms,
      patientHistory
    );
    const targetDiagnosis = currentDiagnosis || analysis.diagnosis;
    const medications = await MedicationService.getDynamicMedications(
      targetDiagnosis,
      symptoms
    );

    const completeAnalysis = { ...analysis, medications };

    return NextResponse.json({
      success: true,
      prescription: completeAnalysis,
      timestamp: new Date().toISOString(),
      source: analysis.aiModelUsed === "local_fallback" ? "local" : "ai",
    });
  } catch (error) {
    console.error("Prescription generation API error:", error);
    return NextResponse.json({
      success: true,
      prescription: {
        diagnosis: "نیازمند ارزیابی پزشک",
        confidence: "low",
        clinicalNotes: "سیستم موقتاً در دسترس نیست. لطفاً با پزشک مشورت کنید.",
        medications: [],
        recommendations: ["مراجعه به پزشک"],
        warnings: ["این یک پاسخ موقتی است"],
      },
      timestamp: new Date().toISOString(),
      source: "fallback",
    });
  }
}
