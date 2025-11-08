// app/api/presets/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Enhanced preset prescriptions with diverse medications
    const presetPrescriptions = {
      common_cold: {
        id: "common_cold",
        patientInfo: {
          name: "بیمار سرماخورده",
          age: 35,
          gender: "مرد",
        },
        diagnosis: "سرماخوردگی ویروسی",
        chiefComplaint: "آبریزش بینی، عطسه و گلودرد خفیف",
        historyOfPresentIllness:
          "بیمار با علائم سرماخوردگی از ۲ روز قبل مراجعه نموده است",
        physicalExamination: "حلق کمی قرمز، عدم تورم لوزه‌ها",
        prescription: [
          {
            id: "1",
            medicine: "Chlorpheniramine",
            dosage: "4 mg",
            form: "tablet",
            frequency: "هر ۸ ساعت",
            duration: "۵ روز",
            route: "oral",
            instructions: "برای کاهش عطسه و آبریزش",
            notes: "ممکن است باعث خواب آلودگی شود",
          },
          {
            id: "2",
            medicine: "Acetaminophen",
            dosage: "500 mg",
            form: "tablet",
            frequency: "هر ۶ ساعت در صورت نیاز",
            duration: "۳ روز",
            route: "oral",
            instructions: "برای تب و بدن درد",
            notes: "",
          },
        ],
        instructions: "استراحت و مصرف مایعات گرم",
        followUp: "در صورت عدم بهبود پس از ۳ روز مراجعه شود",
        createdAt: new Date().toISOString(),
      },
      // ... rest of your presets remain the same
    };

    return NextResponse.json(presetPrescriptions);
  } catch (error) {
    console.error("Presets API error:", error);
    return NextResponse.json(
      { error: "Failed to load preset prescriptions" },
      { status: 500 }
    );
  }
}
