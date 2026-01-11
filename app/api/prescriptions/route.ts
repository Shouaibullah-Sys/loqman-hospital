// app/api/prescriptions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db, dbQuery, checkDatabaseConnection } from "@/db/index";
import { prescriptions, medicines } from "@/db/schema"; // Removed prescriptionTests import
import { auth } from "@clerk/nextjs/server";
import { eq, and, like, or, inArray, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// Define the type for incoming medicine data
interface IncomingMedicine {
  id?: string;
  medicine: string; // Required for simplified form
  dosage: string;
  dosagePersian?: string;
  form?: string;
  formPersian?: string;
  frequency?: string;
  frequencyPersian?: string;
  duration?: string;
  durationPersian?: string;
  route?: string;
  timing?: string;
  withFood?: boolean;
  instructions?: string;
  instructionsPersian?: string;
  notes?: string;
}

export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/prescriptions called");

    const { userId } = await auth();
    console.log("User ID:", userId);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    // Check database connectivity first
    const connectionCheck = await checkDatabaseConnection();
    if (!connectionCheck.healthy) {
      console.error("Database connection failed:", connectionCheck.error);
      return NextResponse.json(
        {
          success: false,
          error:
            "Database connection is currently unavailable. Please try again later.",
        },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    let whereCondition = eq(prescriptions.userId, userId);

    if (search) {
      const searchCondition = or(
        like(prescriptions.patientName, `%${search}%`)
        // Removed doctorName search since it's removed from schema
      );
      whereCondition = and(whereCondition, searchCondition) as any;
    }

    console.log("Fetching prescriptions for user:", userId);

    // Get total count first
    const totalCountResult = await dbQuery(async () => {
      return await db
        .select({ id: prescriptions.id })
        .from(prescriptions)
        .where(whereCondition);
    });

    const totalCount = totalCountResult.length;
    console.log("Total prescriptions found:", totalCount);

    if (totalCount === 0) {
      return NextResponse.json({
        success: true,
        data: {
          prescriptions: [],
          pagination: {
            page,
            limit,
            totalCount: 0,
            totalPages: 0,
          },
        },
      });
    }

    // Get paginated prescription IDs - most recent first
    const prescriptionIds = await dbQuery(async () => {
      return await db
        .select({ id: prescriptions.id })
        .from(prescriptions)
        .where(whereCondition)
        .orderBy(desc(prescriptions.createdAt))
        .limit(limit)
        .offset(skip);
    });

    console.log("Paginated prescription IDs:", prescriptionIds.length);

    // Get prescriptions with medicines only (removed prescriptionTests)
    const prescriptionsData = await dbQuery(async () => {
      return await db
        .select({
          prescription: prescriptions,
          medicine: medicines,
        })
        .from(prescriptions)
        .where(
          inArray(
            prescriptions.id,
            prescriptionIds.map((p) => p.id)
          )
        )
        .leftJoin(medicines, eq(prescriptions.id, medicines.prescriptionId))
        .orderBy(desc(prescriptions.createdAt));
    });

    // Group prescriptions with their medicines only
    const groupedPrescriptions = prescriptionsData.reduce((acc, row) => {
      const prescription = row.prescription;
      const medicine = row.medicine;

      if (!acc[prescription.id]) {
        acc[prescription.id] = {
          ...prescription,
          medicines: [],
        };
      }

      if (medicine) {
        acc[prescription.id].medicines.push(medicine);
      }

      return acc;
    }, {} as Record<string, any>);

    const prescriptionsWithMedicines = Object.values(groupedPrescriptions).map(
      (prescription: any) => ({
        ...prescription,
        medicines: prescription.medicines || [],
      })
    );

    console.log(
      "Final grouped prescriptions:",
      prescriptionsWithMedicines.length
    );

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

    if (
      error instanceof Error &&
      (error.message.includes("database") ||
        error.message.includes("connection"))
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Database connection is currently unavailable. Please try again later.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: "خطا در دریافت نسخه‌ها" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/prescriptions called");

    const { userId } = await auth();
    console.log("User ID:", userId);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    // Check database connectivity first
    const connectionCheck = await checkDatabaseConnection();
    if (!connectionCheck.healthy) {
      console.error("Database connection failed:", connectionCheck.error);
      return NextResponse.json(
        {
          success: false,
          error:
            "Database connection is currently unavailable. Please try again later.",
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    console.log("Received prescription data:", body);

    // Basic validation
    if (!body.patientName) {
      return NextResponse.json(
        { success: false, error: "نام بیمار الزامی است" },
        { status: 400 }
      );
    }

    const prescriptionId = uuidv4();

    // Insert prescription with simplified data (only patient info)
    const [prescription] = await dbQuery(async () => {
      return await db
        .insert(prescriptions)
        .values({
          id: prescriptionId,
          userId: userId,
          // Patient Information ONLY (from your simplified schema)
          patientName: body.patientName,
          patientAge: body.patientAge || "",
          patientGender: body.patientGender || "",
          patientPhone: body.patientPhone || "",
          patientAddress: body.patientAddress || "",
          // System fields
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
    });

    console.log("✅ Prescription created successfully:", prescription.id);

    // Create medicines if provided
    const incomingMeds: IncomingMedicine[] = Array.isArray(body.medicines)
      ? body.medicines
      : [];

    console.log("Incoming medicines payload:", incomingMeds);

    if (incomingMeds.length > 0) {
      const medicinesData = incomingMeds
        .map((med: IncomingMedicine) => {
          const medicineName = med.medicine?.trim();
          const dosage = med.dosage?.trim();

          console.log(
            `Processing medicine: "${medicineName}" with dosage: "${dosage}"`
          );

          if (!medicineName || !dosage) {
            console.log(
              `Skipping medicine ${
                medicineName || "unknown"
              }: missing medicine name or dosage`
            );
            return null;
          }

          const processedMed = {
            id: uuidv4(),
            prescriptionId: prescriptionId,
            medicine: medicineName,
            dosage: dosage,
            dosagePersian: med.dosagePersian || "",
            form: med.form || "tablet",
            formPersian: med.formPersian || "",
            frequency: med.frequency || "",
            frequencyPersian: med.frequencyPersian || "",
            duration: med.duration || "",
            durationPersian: med.durationPersian || "",
            route: med.route || "oral",
            timing: med.timing || "after_meal",
            withFood: med.withFood || false,
            instructions: med.instructions || "",
            instructionsPersian: med.instructionsPersian || "",
            notes: med.notes || "",
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          console.log(`Processed medicine data:`, processedMed);
          return processedMed;
        })
        .filter(Boolean) as any[];

      if (medicinesData.length > 0) {
        try {
          const inserted = await dbQuery(async () => {
            return await db.insert(medicines).values(medicinesData).returning();
          });
          console.log(
            "Medicines inserted:",
            Array.isArray(inserted) ? inserted.length : "unknown"
          );
        } catch (insertErr) {
          console.warn(
            "Insert returning() failed or unsupported, falling back to non-returning insert:",
            insertErr
          );
          await dbQuery(async () => {
            return await db.insert(medicines).values(medicinesData);
          });
        }

        // Verify by selecting from DB
        try {
          const verify = await dbQuery(async () => {
            return await db
              .select()
              .from(medicines)
              .where(eq(medicines.prescriptionId, prescriptionId));
          });
          console.log(
            "Verified medicines count in DB for prescription:",
            prescriptionId,
            "=>",
            verify.length
          );
        } catch (verifyErr) {
          console.error("Verification select after insert failed:", verifyErr);
        }
      } else {
        console.log(
          "No valid medicines to insert for prescription:",
          prescriptionId
        );
      }
    }

    // Fetch the complete prescription with medicines
    const completeData = await dbQuery(async () => {
      return await db
        .select({
          prescription: prescriptions,
          medicine: medicines,
        })
        .from(prescriptions)
        .where(eq(prescriptions.id, prescriptionId))
        .leftJoin(medicines, eq(prescriptions.id, medicines.prescriptionId));
    });

    const groupedData = completeData.reduce((acc, row) => {
      if (!acc.prescription) {
        acc.prescription = row.prescription;
        acc.medicines = [];
      }
      if (row.medicine) {
        acc.medicines.push(row.medicine);
      }
      return acc;
    }, {} as any);

    const prescriptionWithMedicines = {
      ...groupedData.prescription,
      medicines: groupedData.medicines || [],
    };

    console.log("Returning complete prescription data");

    return NextResponse.json({
      success: true,
      data: prescriptionWithMedicines,
      message: "نسخه با موفقیت ایجاد شد",
    });
  } catch (error) {
    console.error("Create prescription error:", error);

    if (error instanceof Error) {
      if (
        error.message.includes("invalid input syntax for type json") ||
        error.message.includes("22P02")
      ) {
        console.error("JSON syntax error:", error.message);
        return NextResponse.json(
          {
            success: false,
            error:
              "خطا در قالب داده‌ها. لطفاً مطمئن شوید که اطلاعات به درستی وارد شده‌اند.",
          },
          { status: 400 }
        );
      }

      if (
        error.message.includes("database") ||
        error.message.includes("connection")
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Database connection is currently unavailable. Please try again later.",
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: "خطا در ایجاد نسخه" },
      { status: 500 }
    );
  }
}

// PATCH endpoint for updating prescriptions (if needed)
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "شناسه نسخه الزامی است" },
        { status: 400 }
      );
    }

    // Only update patient fields (no medical data in simplified version)
    const allowedFields = [
      "patientName",
      "patientAge",
      "patientGender",
      "patientPhone",
      "patientAddress",
    ];

    const filteredUpdateData: Record<string, any> = {};
    for (const key of allowedFields) {
      if (updateData[key] !== undefined) {
        filteredUpdateData[key] = updateData[key];
      }
    }

    // Add updated timestamp
    filteredUpdateData.updatedAt = new Date();

    const [updated] = await dbQuery(async () => {
      return await db
        .update(prescriptions)
        .set(filteredUpdateData)
        .where(and(eq(prescriptions.id, id), eq(prescriptions.userId, userId)))
        .returning();
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "نسخه یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "نسخه با موفقیت به‌روزرسانی شد",
    });
  } catch (error) {
    console.error("Update prescription error:", error);
    return NextResponse.json(
      { success: false, error: "خطا در به‌روزرسانی نسخه" },
      { status: 500 }
    );
  }
}
