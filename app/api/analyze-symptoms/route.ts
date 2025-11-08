import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { MedicalAIService } from "@/services/huggingfaceService";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
    }

    const { symptoms, patientHistory } = await request.json();

    if (!symptoms?.trim()) {
      return NextResponse.json(
        { error: "شرح حال بیمار الزامی است" },
        { status: 400 }
      );
    }

    const analysis = await MedicalAIService.analyzeSymptoms(
      symptoms,
      patientHistory
    );

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Symptom analysis API error:", error);
    return NextResponse.json(
      { error: "خطا در تحلیل علائم", success: false },
      { status: 500 }
    );
  }
}
