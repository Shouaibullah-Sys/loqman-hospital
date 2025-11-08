// app/api/suggest/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
    }

    const { text } = await request.json();

    if (!text || text.length < 5) {
      return NextResponse.json(
        { error: "Text too short for prescription generation" },
        { status: 400 }
      );
    }

    // Enhanced AI-generated prescription with diverse recommendations
    const aiPrescription = await generateIntelligentPrescription(text);

    return NextResponse.json(aiPrescription);
  } catch (error) {
    console.error("Suggest API error:", error);
    return NextResponse.json(
      { error: "Failed to generate prescription" },
      { status: 500 }
    );
  }
}
// Intelligent prescription generator with diverse recommendations
async function generateIntelligentPrescription(inputText: string) {
  const symptoms = inputText.toLowerCase();

  // Analyze symptoms and generate appropriate prescription
  const analysis = analyzeSymptoms(symptoms);
  const medications = generateMedications(analysis);

  return {
    id: Date.now().toString(),
    patientName: "",
    patientAge: "",
    patientGender: "",
    patientPhone: "",

    // Clinical Information - Auto-filled from AI analysis
    chiefComplaint: analysis.chiefComplaint,
    historyOfPresentIllness: generateHistory(analysis),
    physicalExamination: generatePhysicalExam(analysis),
    diagnosis: analysis.diagnosis,
    differentialDiagnosis: analysis.differentialDiagnosis,

    // Vital Signs - Context-aware defaults
    pulseRate: analysis.vitalSigns.pulseRate,
    bloodPressure: analysis.vitalSigns.bloodPressure,
    temperature: analysis.vitalSigns.temperature,
    respiratoryRate: analysis.vitalSigns.respiratoryRate,
    oxygenSaturation: analysis.vitalSigns.oxygenSaturation,

    // Medications - AI-generated based on symptoms
    prescription: medications,

    // Instructions - Context-aware
    instructions: analysis.instructions,
    followUp: analysis.followUp,
    restrictions: analysis.restrictions,

    // Medical History
    allergies: [],
    currentMedications: [],
    pastMedicalHistory: "",

    // Professional Info
    doctorName: "دکتر احمدی",
    clinicName: "کلینیک تخصصی",

    createdAt: new Date().toISOString(),
  };
}

// Enhanced symptom analysis with multiple conditions
function analyzeSymptoms(symptoms: string) {
  const conditions = [
    {
      name: "برونشیت حاد",
      keywords: ["سرفه", "خلط", "سینه", "ریه", "برونشیت"],
      severity: "moderate",
      vitalSigns: {
        pulseRate: "80-90",
        bloodPressure: "120/80",
        temperature: "37.5-38.5",
        respiratoryRate: "18-22",
        oxygenSaturation: "95-98%",
      },
    },
    {
      name: "فارنژیت استرپتوکوکی",
      keywords: ["گلودرد", "بلع", "لوزه", "حلق", "سفید"],
      severity: "moderate",
      vitalSigns: {
        pulseRate: "85-95",
        bloodPressure: "120/80",
        temperature: "38.0-39.0",
        respiratoryRate: "16-20",
        oxygenSaturation: "97-99%",
      },
    },
    {
      name: "سینوزیت حاد",
      keywords: ["سینوس", "صورت", "بینى", "سردرد", "احتقان"],
      severity: "mild",
      vitalSigns: {
        pulseRate: "70-80",
        bloodPressure: "110/70",
        temperature: "37.0-37.8",
        respiratoryRate: "16-18",
        oxygenSaturation: "98-100%",
      },
    },
    {
      name: "عفونت ادراری",
      keywords: ["ادرار", "سوزش", "تکرر", "کلیه", "مثانه"],
      severity: "moderate",
      vitalSigns: {
        pulseRate: "75-85",
        bloodPressure: "115/75",
        temperature: "37.5-38.5",
        respiratoryRate: "16-20",
        oxygenSaturation: "97-99%",
      },
    },
    {
      name: "میگرن",
      keywords: ["سردرد", "میگرن", "ضربان", "تهوع", "نور"],
      severity: "moderate",
      vitalSigns: {
        pulseRate: "70-80",
        bloodPressure: "110/70",
        temperature: "36.5-37.0",
        respiratoryRate: "14-16",
        oxygenSaturation: "98-100%",
      },
    },
    {
      name: "رینیت آلرژیک",
      keywords: ["آلرژی", "عطسه", "خارش", "آبریزش", "حساسیت"],
      severity: "mild",
      vitalSigns: {
        pulseRate: "65-75",
        bloodPressure: "110/70",
        temperature: "36.5-37.0",
        respiratoryRate: "16-18",
        oxygenSaturation: "98-100%",
      },
    },
  ];

  // Find matching conditions
  const matchedConditions = conditions.filter((condition) =>
    condition.keywords.some((keyword) => symptoms.includes(keyword))
  );

  // Select primary diagnosis (highest match count)
  const primaryCondition =
    matchedConditions.length > 0
      ? matchedConditions.reduce((prev, current) =>
          prev.keywords.filter((k) => symptoms.includes(k)).length >
          current.keywords.filter((k) => symptoms.includes(k)).length
            ? prev
            : current
        )
      : {
          name: "عفونت تنفسی فوقانی",
          severity: "mild",
          vitalSigns: {
            pulseRate: "72-80",
            bloodPressure: "120/80",
            temperature: "36.8-37.2",
            respiratoryRate: "16-20",
            oxygenSaturation: "98%",
          },
        };

  return {
    diagnosis: primaryCondition.name,
    severity: primaryCondition.severity,
    vitalSigns: primaryCondition.vitalSigns,
    chiefComplaint: generateChiefComplaint(symptoms),
    differentialDiagnosis: generateDifferentialDiagnosis(matchedConditions),
    instructions: generateInstructions(primaryCondition.name),
    followUp: generateFollowUp(primaryCondition.severity),
    restrictions: generateRestrictions(primaryCondition.name),
  };
}

// Generate diverse medications based on condition
function generateMedications(analysis: any) {
  const medicationDatabase = {
    "برونشیت حاد": [
      {
        medicine: "Amoxicillin",
        dosage: "500 mg",
        form: "capsule",
        frequency: "هر ۸ ساعت",
        duration: "۷ روز",
        route: "oral",
        instructions: "قبل از غذا مصرف شود",
        notes: "آنتی بیوتیک وسیع الطیف",
      },
      {
        medicine: "Bromhexine",
        dosage: "8 mg",
        form: "tablet",
        frequency: "هر ۸ ساعت",
        duration: "۵ روز",
        route: "oral",
        instructions: "بعد از غذا",
        notes: "اکسپکتورانت",
      },
      {
        medicine: "Acetaminophen",
        dosage: "500 mg",
        form: "tablet",
        frequency: "هر ۶ ساعت در صورت نیاز",
        duration: "۳ روز",
        route: "oral",
        instructions: "برای تب و درد",
        notes: "حداکثر ۴ عدد در روز",
      },
    ],
    "فارنژیت استرپتوکوکی": [
      {
        medicine: "Penicillin V",
        dosage: "500 mg",
        form: "tablet",
        frequency: "هر ۶ ساعت",
        duration: "۱۰ روز",
        route: "oral",
        instructions: "نیم ساعت قبل از غذا",
        notes: "برای عفونت استرپتوکوکی",
      },
      {
        medicine: "Ibuprofen",
        dosage: "400 mg",
        form: "tablet",
        frequency: "هر ۸ ساعت",
        duration: "۵ روز",
        route: "oral",
        instructions: "با غذا مصرف شود",
        notes: "برای درد و التهاب",
      },
    ],
    "سینوزیت حاد": [
      {
        medicine: "Amoxicillin-Clavulanate",
        dosage: "625 mg",
        form: "tablet",
        frequency: "هر ۱۲ ساعت",
        duration: "۷ روز",
        route: "oral",
        instructions: "با غذا",
        notes: "آنتی بیوتیک",
      },
      {
        medicine: "Pseudoephedrine",
        dosage: "60 mg",
        form: "tablet",
        frequency: "هر ۱۲ ساعت",
        duration: "۵ روز",
        route: "oral",
        instructions: "صبح و عصر",
        notes: "دکونژستان",
      },
      {
        medicine: "Cetirizine",
        dosage: "10 mg",
        form: "tablet",
        frequency: "روزی یکبار",
        duration: "۷ روز",
        route: "oral",
        instructions: "شبها قبل خواب",
        notes: "آنتی هیستامین",
      },
    ],
    "عفونت ادراری": [
      {
        medicine: "Ciprofloxacin",
        dosage: "500 mg",
        form: "tablet",
        frequency: "هر ۱۲ ساعت",
        duration: "۷ روز",
        route: "oral",
        instructions: "با معده خالی",
        notes: "آنتی بیوتیک",
      },
      {
        medicine: "Phenazopyridine",
        dosage: "200 mg",
        form: "tablet",
        frequency: "هر ۸ ساعت",
        duration: "۲ روز",
        route: "oral",
        instructions: "بعد از غذا",
        notes: "برای سوزش ادرار",
      },
    ],
    میگرن: [
      {
        medicine: "Sumatriptan",
        dosage: "50 mg",
        form: "tablet",
        frequency: "در شروع حمله",
        duration: "طبق نیاز",
        route: "oral",
        instructions: "در شروع سردرد مصرف شود",
        notes: "حداکثر ۲ عدد در روز",
      },
      {
        medicine: "Ibuprofen",
        dosage: "400 mg",
        form: "tablet",
        frequency: "هر ۶ ساعت در صورت نیاز",
        duration: "۳ روز",
        route: "oral",
        instructions: "با غذا",
        notes: "برای درد",
      },
      {
        medicine: "Metoclopramide",
        dosage: "10 mg",
        form: "tablet",
        frequency: "هر ۸ ساعت در صورت تهوع",
        duration: "۲ روز",
        route: "oral",
        instructions: "قبل از غذا",
        notes: "برای تهوع و استفراغ",
      },
    ],
    "رینیت آلرژیک": [
      {
        medicine: "Loratadine",
        dosage: "10 mg",
        form: "tablet",
        frequency: "روزی یکبار",
        duration: "۱۴ روز",
        route: "oral",
        instructions: "صبحها",
        notes: "آنتی هیستامین غیر خواب آور",
      },
      {
        medicine: "Fluticasone",
        dosage: "50 mcg",
        form: "spray",
        frequency: "هر سوراخ بینی دو پاف روزی دو بار",
        duration: "۳۰ روز",
        route: "nasal",
        instructions: "صبح و شب",
        notes: "اسپری بینی",
      },
      {
        medicine: "Montelukast",
        dosage: "10 mg",
        form: "tablet",
        frequency: "روزی یکبار",
        duration: "۳۰ روز",
        route: "oral",
        instructions: "شبها قبل خواب",
        notes: "برای آلرژی",
      },
    ],
    "عفونت تنفسی فوقانی": [
      {
        medicine: "Amoxicillin",
        dosage: "500 mg",
        form: "capsule",
        frequency: "هر ۸ ساعت",
        duration: "۷ روز",
        route: "oral",
        instructions: "قبل از غذا",
        notes: "آنتی بیوتیک",
      },
      {
        medicine: "Acetaminophen",
        dosage: "500 mg",
        form: "tablet",
        frequency: "هر ۶ ساعت در صورت نیاز",
        duration: "۳ روز",
        route: "oral",
        instructions: "برای تب و درد",
        notes: "حداکثر ۴ عدد در روز",
      },
      {
        medicine: "Chlorpheniramine",
        dosage: "4 mg",
        form: "tablet",
        frequency: "هر ۸ ساعت",
        duration: "۵ روز",
        route: "oral",
        instructions: "برای کاهش عطسه و آبریزش",
        notes: "ممکن است باعث خواب آلودگی شود",
      },
    ],
  };

  const medications =
    medicationDatabase[analysis.diagnosis as keyof typeof medicationDatabase] ||
    medicationDatabase["عفونت تنفسی فوقانی"];

  // Add IDs to medications
  return medications.map((med, index) => ({
    id: Math.random().toString(36).substr(2, 9),
    ...med,
  }));
}

// Helper functions
function generateChiefComplaint(symptoms: string): string {
  if (symptoms.includes("سرفه") && symptoms.includes("تب")) {
    return "سرفه خلط دار، تب و بدن درد";
  } else if (symptoms.includes("گلودرد") && symptoms.includes("بلع")) {
    return "گلودرد شدید و مشکل در بلع";
  } else if (symptoms.includes("سینوس") || symptoms.includes("صورت")) {
    return "احتقان بینی، سردرد و فشار صورت";
  } else if (symptoms.includes("ادرار") || symptoms.includes("سوزش")) {
    return "سوزش ادرار و تکرر ادرار";
  } else if (symptoms.includes("سردرد") && symptoms.includes("ضربان")) {
    return "سردرد ضربان دار و تهوع";
  } else if (symptoms.includes("آلرژی") || symptoms.includes("عطسه")) {
    return "عطسه، آبریزش بینی و خارش چشم";
  }
  return "علائم عمومی سرماخوردگی";
}

function generateHistory(analysis: any): string {
  return `بیمار با شکایت ${analysis.chiefComplaint} مراجعه نموده است. شروع علائم از ۲-۳ روز گذشته بوده و به تدریج تشدید یافته است.`;
}

function generatePhysicalExam(analysis: any): string {
  const exams = {
    "برونشیت حاد": "رال خشک در قاعده ریه راست، سرفه‌های خلط دار",
    "فارنژیت استرپتوکوکی":
      "حلق قرمز و متورم، تورم لوزه‌ها، ندولر لنفاوی گردنی حساس",
    "سینوزیت حاد": "حساسیت در سینوس‌های فکی و پیشانی، ترشح پشت حلق",
    "عفونت ادراری": "حساسیت خفیف در ناحیه سوپراپوبیک، بدون ادم",
    میگرن: "فشار خون نرمال، عدم وجود علائم عصبی کانونی",
    "رینیت آلرژیک": "پلان بینی، حلقه‌های تیره زیر چشم، مخاط بینی رنگ پریده",
  };

  return (
    exams[analysis.diagnosis as keyof typeof exams] ||
    "وضعیت عمومی قابل قبول، علائم حیاتی پایدار"
  );
}

function generateDifferentialDiagnosis(matchedConditions: any[]): string {
  if (matchedConditions.length > 1) {
    return matchedConditions
      .slice(0, 3)
      .map((c) => c.name)
      .join("، ");
  }
  return "سرماخوردگی معمولی، آلرژی، سینوزیت";
}

function generateInstructions(diagnosis: string): string {
  const instructions = {
    "برونشیت حاد": "استراحت کافی، مصرف مایعات گرم، اجتناب از هوای سرد",
    "فارنژیت استرپتوکوکی":
      "غرغره آب نمک، مصرف مایعات فراوان، پرهیز از غذاهای تند",
    "سینوزیت حاد": "شستشوی بینی با سرم نمکی، مصرف مایعات گرم",
    "عفونت ادراری": "مصرف زیاد مایعات، پرهیز از کافئین",
    میگرن: "استراحت در محیط تاریک و ساکت، پرهیز از محرک‌های غذایی",
    "رینیت آلرژیک": "اجتناب از عوامل آلرژن، شستشوی بینی",
  };

  return (
    instructions[diagnosis as keyof typeof instructions] ||
    "استراحت کافی و مصرف منظم داروها"
  );
}

function generateFollowUp(severity: string): string {
  if (severity === "moderate" || severity === "severe") {
    return "در صورت عدم بهبود پس از ۴۸ ساعت یا تشدید علائم مراجعه شود";
  }
  return "در صورت عدم بهبود پس از ۳ روز مراجعه شود";
}

function generateRestrictions(diagnosis: string): string {
  const restrictions = {
    "برونشیت حاد": "پرهیز از سیگار و هوای آلوده، محدودیت فعالیت بدنی شدید",
    "فارنژیت استرپتوکوکی": "پرهیز از غذاهای تند و داغ، محدودیت صحبت کردن",
    میگرن: "پرهیز از پنیر کهنه، شکلات، قهوه و استرس",
    "عفونت ادراری": "پرهیز از رابطه جنسی تا پایان درمان، محدودیت فعالیت شدید",
  };

  return (
    restrictions[diagnosis as keyof typeof restrictions] ||
    "فعالیت سبک، پرهیز از سرما"
  );
}
