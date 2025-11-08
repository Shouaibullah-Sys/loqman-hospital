// app/api/debug/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db/index";
import { prescriptions, medicines } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all prescriptions for user
    const allPrescriptions = await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.userId, userId));

    // Get all medicines
    const allMedicines = await db.select().from(medicines);

    // Get prescriptions with their medicines
    const prescriptionsWithMedicines = await db
      .select({
        prescription: prescriptions,
        medicine: medicines,
      })
      .from(prescriptions)
      .where(eq(prescriptions.userId, userId))
      .leftJoin(medicines, eq(prescriptions.id, medicines.prescriptionId));

    return NextResponse.json({
      prescriptionsCount: allPrescriptions.length,
      medicinesCount: allMedicines.length,
      prescriptions: allPrescriptions.map((p) => ({
        id: p.id,
        patientName: p.patientName,
      })),
      medicines: allMedicines.map((m) => ({
        id: m.id,
        prescriptionId: m.prescriptionId,
        medicine: m.medicine,
      })),
      joinedData: prescriptionsWithMedicines.map((item) => ({
        prescriptionId: item.prescription.id,
        patientName: item.prescription.patientName,
        medicine: item.medicine ? item.medicine.medicine : null,
      })),
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: "Debug failed" }, { status: 500 });
  }
}
