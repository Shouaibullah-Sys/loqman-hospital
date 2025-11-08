// app/api/medical-analysis/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// Medical analysis with multiple model fallbacks
const MEDICAL_MODELS = [
  "microsoft/BioGPT-Large",
  "stanford-crfm/BioMedLM",
  "microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract",
];

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
    }

    const {
      symptoms,
      patientHistory,
      modelPreference = 0,
    } = await request.json();

    if (!symptoms?.trim()) {
      return NextResponse.json(
        { error: "شرح حال بیمار الزامی است" },
        { status: 400 }
      );
    }

    const selectedModel = MEDICAL_MODELS[modelPreference] || MEDICAL_MODELS[0];

    const analysis = await getAIMedicalAnalysis(
      symptoms,
      patientHistory,
      selectedModel
    );

    return NextResponse.json({
      analysis: analysis.text,
      confidence: analysis.confidence,
      model: selectedModel,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Medical analysis error:", error);

    try {
      const { symptoms, patientHistory } = await request
        .json()
        .catch(() => ({}));
      return NextResponse.json({
        analysis: await generateLocalAnalysis(symptoms, patientHistory),
        confidence: "low",
        model: "local_fallback",
        timestamp: new Date().toISOString(),
      });
    } catch {
      return NextResponse.json(
        { error: "خطا در تحلیل علائم" },
        { status: 500 }
      );
    }
  }
}

async function getAIMedicalAnalysis(
  symptoms: string,
  patientHistory: string = "",
  model: string
): Promise<{ text: string; confidence: string }> {
  try {
    const prompt = `شرح حال بیمار: ${symptoms}
    ${patientHistory ? `تاریخچه پزشکی: ${patientHistory}` : ""}
    
    لطفاً به عنوان یک پزشک متخصص تحلیل کنید:
    ۱. تشخیص‌های احتمالی
    ۲. معاینات لازم
    ۳. اقدامات اولیه
    ۴. هشدارهای مهم
    
    پاسخ به زبان فارسی و حرفه‌ای باشد.`;

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 800,
            temperature: 0.2,
            do_sample: false,
            return_full_text: false,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Model ${model} unavailable`);
    }

    const result = await response.json();
    const generatedText = result[0]?.generated_text || "";

    return {
      text:
        generatedText ||
        (await generateLocalAnalysis(symptoms, patientHistory)),
      confidence: generatedText ? "high" : "medium",
    };
  } catch (error) {
    console.error(`Model ${model} failed:`, error);

    // Try next model in fallback chain
    const currentIndex = MEDICAL_MODELS.indexOf(model);
    const nextModel = MEDICAL_MODELS[currentIndex + 1];

    if (nextModel) {
      return getAIMedicalAnalysis(symptoms, patientHistory, nextModel);
    }

    return {
      text: await generateLocalAnalysis(symptoms, patientHistory),
      confidence: "low",
    };
  }
}

// Enhanced local analysis with medical knowledge
async function generateLocalAnalysis(
  symptoms: string,
  patientHistory?: string
): Promise<string> {
  const medicalKnowledge = {
    conditions: {
      "سرفه خشک": "برونشیت حاد، آسم، آلرژی",
      "سرفه خلط دار": "برونشیت، پنومونی، عفونت تنفسی",
      "تب بالا": "عفونت باکتریال، آنفولانزا، COVID-19",
      گلودرد: "فارنژیت، تونسیلیت، استرپتوکوک",
      "سردرد شدید": "میگرن، سینوزیت، فشار خون",
      "درد قفسه سینه": "مشکلات قلبی، ریوی، گوارشی",
      "تنگی نفس": "آسم، COPD، اضطراب، مشکلات قلبی",
    },
    recommendations: {
      عفونی: "استراحت، مایعات، آنتی بیوتیک در صورت باکتریال",
      تنفسی: "معاینه ریه، اسپیرومتری، عکس قفسه سینه",
      قلبی: "نوار قلب، اکو، تست ورزش",
      عصبی: "سی تی اسکن، MRI، معاینه عصبی",
    },
  };

  const symptomList = symptoms.toLowerCase();
  let possibleConditions: string[] = [];
  let recommendedActions: string[] = ["معاینه فیزیکی کامل"];

  // Analyze symptoms
  Object.entries(medicalKnowledge.conditions).forEach(
    ([symptom, conditions]) => {
      if (symptomList.includes(symptom.toLowerCase())) {
        possibleConditions.push(conditions);
      }
    }
  );

  // Generate recommendations based on possible conditions
  if (symptomList.includes("سرفه") || symptomList.includes("تنگی نفس")) {
    recommendedActions.push("معاینه ریه", "عکس قفسه سینه در صورت نیاز");
  }

  if (symptomList.includes("تب") || symptomList.includes("بدن درد")) {
    recommendedActions.push("آزمایش خون", "کشت خلط در صورت سرفه");
  }

  if (symptomList.includes("سردرد") || symptomList.includes("سرگیجه")) {
    recommendedActions.push("معاینه عصبی", "اندازه گیری فشار خون");
  }

  const uniqueConditions = [
    ...new Set(possibleConditions.flatMap((c) => c.split("، "))),
  ];

  return `تحلیل اولیه بر اساس شرح حال:

شرح حال: ${symptoms}
${patientHistory ? `تاریخچه: ${patientHistory}` : ""}

تشخیص‌های احتمالی:
${uniqueConditions.map((condition) => `• ${condition}`).join("\n")}

معاینات پیشنهادی:
${recommendedActions.map((action) => `• ${action}`).join("\n")}

توصیه‌های اولیه:
• استراحت کافی
• مصرف مایعات فراوان
• پایش علائم حیاتی
• مراجعه به پزشک در صورت تشدید علائم

تذکر: این تحلیل کامپیوتری است و جایگزین معاینه پزشک نمی‌باشد.`;
}
