import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { prescriptions, medicines } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and, like, or, inArray } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    let whereCondition = eq(prescriptions.userId, userId);

    if (search) {
      const searchCondition = or(
        like(prescriptions.patientName, `%${search}%`),
        like(prescriptions.diagnosis, `%${search}%`),
        like(prescriptions.doctorName, `%${search}%`)
      );
      whereCondition = and(whereCondition, searchCondition) as any;
    }

    // Get prescriptions
    const prescriptionsData = await db
      .select()
      .from(prescriptions)
      .where(whereCondition)
      .orderBy(prescriptions.createdAt)
      .limit(limit)
      .offset(skip);

    // Get medicines for each prescription
    const prescriptionsWithMedicines = await Promise.all(
      prescriptionsData.map(async (prescription) => {
        const medicineData = await db
          .select()
          .from(medicines)
          .where(eq(medicines.prescriptionId, prescription.id));

        return {
          ...prescription,
          medicines: medicineData,
        };
      })
    );

    // Get total count
    const totalCountResult = await db
      .select()
      .from(prescriptions)
      .where(whereCondition);

    const totalCount = totalCountResult.length;

    return NextResponse.json({
      success: true,
      data: {
        prescriptions: prescriptionsWithMedicines,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get prescriptions error:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت نسخه‌ها" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("Received prescription data:", body);

    // Basic validation
    if (!body.patientName || !body.diagnosis) {
      return NextResponse.json(
        { success: false, error: "نام بیمار و تشخیص بیماری الزامی است" },
        { status: 400 }
      );
    }

    const prescriptionId = uuidv4();

    // Create prescription
    const [prescription] = await db
      .insert(prescriptions)
      .values({
        id: prescriptionId,
        userId: userId,
        patientName: body.patientName,
        patientAge: body.patientAge || "",
        patientGender: body.patientGender || "",
        patientPhone: body.patientPhone || "",
        patientAddress: body.patientAddress || "",
        diagnosis: body.diagnosis,
        chiefComplaint: body.chiefComplaint || "",
        historyOfPresentIllness: body.historyOfPresentIllness || "",
        physicalExamination: body.physicalExamination || "",
        differentialDiagnosis: body.differentialDiagnosis || "",
        pulseRate: body.pulseRate || "",
        bloodPressure: body.bloodPressure || "",
        temperature: body.temperature || "",
        respiratoryRate: body.respiratoryRate || "",
        oxygenSaturation: body.oxygenSaturation || "",
        allergies: body.allergies || [],
        currentMedications: body.currentMedications || [],
        pastMedicalHistory: body.pastMedicalHistory || "",
        familyHistory: body.familyHistory || "",
        socialHistory: body.socialHistory || "",
        instructions: body.instructions || "",
        followUp: body.followUp || "",
        restrictions: body.restrictions || "",
        doctorName: body.doctorName || "دکتر",
        doctorLicenseNumber: body.doctorLicenseNumber || "",
        clinicName: body.clinicName || "",
        clinicAddress: body.clinicAddress || "",
        doctorFree: body.doctorFree || "",
        prescriptionDate: new Date(),
        prescriptionNumber: body.prescriptionNumber || "",
        source: body.source || "manual",
        status: "active",
        aiConfidence: body.aiConfidence || "",
        aiModelUsed: body.aiModelUsed || "",
        processingTime: body.processingTime || 0,
        rawAiResponse: body.rawAiResponse || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Create medicines if provided
    if (body.medicines && Array.isArray(body.medicines)) {
      for (const med of body.medicines) {
        const medicineName = med.medicine || med.name;
        if (medicineName && med.dosage) {
          await db.insert(medicines).values({
            id: uuidv4(),
            prescriptionId: prescriptionId,
            medicine: medicineName,
            dosage: med.dosage,
            form: med.form || "",
            frequency: med.frequency || "",
            duration: med.duration || "",
            route: med.route || "oral",
            timing: med.timing || "",
            withFood: med.withFood || false,
            instructions: med.instructions || "",
            notes: med.notes || "",
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
    }

    // Fetch the complete prescription with medicines
    const medicineData = await db
      .select()
      .from(medicines)
      .where(eq(medicines.prescriptionId, prescriptionId));

    const prescriptionWithMedicines = {
      ...prescription,
      medicines: medicineData,
    };

    return NextResponse.json({
      success: true,
      data: prescriptionWithMedicines,
      message: "نسخه با موفقیت ایجاد شد",
    });
  } catch (error) {
    console.error("Create prescription error:", error);
    return NextResponse.json(
      { success: false, error: "خطا در ایجاد نسخه" },
      { status: 500 }
    );
  }
}
