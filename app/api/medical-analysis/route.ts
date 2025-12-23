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
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const {
      symptoms,
      patientHistory,
      modelPreference = 0,
    } = await request.json();

    if (!symptoms?.trim()) {
      return NextResponse.json(
        { error: "Patient history is required" },
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
        { error: "Error analyzing symptoms" },
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
    const prompt = `Patient history: ${symptoms}
    ${patientHistory ? `Medical history: ${patientHistory}` : ""}
    
    Please analyze as a specialist doctor:
    1. Possible diagnoses
    2. Required examinations
    3. Initial actions
    4. Important warnings
    
    Response should be professional and in English.`;

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
      "dry cough": "Acute bronchitis, asthma, allergy",
      "productive cough": "Bronchitis, pneumonia, respiratory infection",
      "high fever": "Bacterial infection, influenza, COVID-19",
      "sore throat": "Pharyngitis, tonsillitis, streptococcus",
      "severe headache": "Migraine, sinusitis, hypertension",
      "chest pain": "Cardiac, pulmonary, gastrointestinal problems",
      "shortness of breath": "Asthma, COPD, anxiety, cardiac problems",
    },
    recommendations: {
      infectious: "Rest, fluids, antibiotics if bacterial",
      respiratory: "Lung examination, spirometry, chest X-ray",
      cardiac: "ECG, echocardiogram, stress test",
      neurological: "CT scan, MRI, neurological examination",
    },
  };

  const symptomList = symptoms.toLowerCase();
  let possibleConditions: string[] = [];
  let recommendedActions: string[] = ["Complete physical examination"];

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
    recommendedActions.push("Lung examination", "Chest X-ray if needed");
  }

  if (symptomList.includes("تب") || symptomList.includes("بدن درد")) {
    recommendedActions.push("Blood test", "Sputum culture if cough");
  }

  if (symptomList.includes("سردرد") || symptomList.includes("سرگیجه")) {
    recommendedActions.push(
      "Neurological examination",
      "Blood pressure measurement"
    );
  }

  const uniqueConditions = [
    ...new Set(possibleConditions.flatMap((c) => c.split(", "))),
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
