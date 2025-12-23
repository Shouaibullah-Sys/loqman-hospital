// app/api/presets/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../db/index";
import { prescriptions, medicines } from "../../../../db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    // Check if it's a user-created preset (database lookup)
    if (id.startsWith("user_")) {
      // Get the prescription from database
      const prescriptionData = await db
        .select()
        .from(prescriptions)
        .where(eq(prescriptions.id, id));

      if (prescriptionData.length === 0) {
        return NextResponse.json(
          { error: "Preset not found" },
          { status: 404 }
        );
      }

      const prescription = prescriptionData[0];

      // Get medicines for this prescription
      const prescriptionMedicines = await db
        .select()
        .from(medicines)
        .where(eq(medicines.prescriptionId, id));

      const presetData = {
        ...prescription,
        medicines: prescriptionMedicines.map((med) => ({
          ...med,
          id: med.id,
        })),
      };

      return NextResponse.json(presetData);
    } else {
      // For predefined presets, get from the main presets API
      const response = await fetch(`${request.nextUrl.origin}/api/presets`);
      const allPresets = await response.json();

      if (allPresets[id]) {
        return NextResponse.json(allPresets[id]);
      } else {
        return NextResponse.json(
          { error: "Preset not found" },
          { status: 404 }
        );
      }
    }
  } catch (error) {
    console.error("Error fetching preset:", error);
    return NextResponse.json(
      { error: "Failed to fetch preset" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    // Only allow editing user-created presets
    if (!id.startsWith("user_")) {
      return NextResponse.json(
        { error: "Cannot edit predefined presets" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      diagnosis,
      chiefComplaint,
      category,
      urgency,
      instructions,
      followUp,
      restrictions,
      medicines: presetMedicines,
    } = body;

    // Validate required fields
    if (!name || !diagnosis || !category) {
      return NextResponse.json(
        { error: "Name, diagnosis, and category are required" },
        { status: 400 }
      );
    }

    // Update the prescription record
    const updatedPrescription = {
      diagnosis,
      chiefComplaint: chiefComplaint || "",
      instructions: instructions || "",
      followUp: followUp || "",
      restrictions: restrictions || "",
      updatedAt: new Date(),
    };

    await db
      .update(prescriptions)
      .set(updatedPrescription)
      .where(eq(prescriptions.id, id));

    // Delete existing medicines
    await db.delete(medicines).where(eq(medicines.prescriptionId, id));

    // Insert updated medicines if provided
    if (presetMedicines && Array.isArray(presetMedicines)) {
      for (let i = 0; i < presetMedicines.length; i++) {
        const med = presetMedicines[i];
        if (med.medicine && med.dosage) {
          const medicineId = `${id}_med_${i}`;
          await db.insert(medicines).values({
            id: medicineId,
            prescriptionId: id,
            medicine: med.medicine,
            dosage: med.dosage,
            frequency: med.frequency || "",
            duration: med.duration || "",
            route: med.route || "",
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

    // Return the updated preset
    const updatedPreset = {
      id,
      name,
      category,
      urgency: urgency || "medium",
      ...updatedPrescription,
      medicines: presetMedicines || [],
    };

    return NextResponse.json(updatedPreset);
  } catch (error) {
    console.error("Error updating preset:", error);
    return NextResponse.json(
      { error: "Failed to update preset" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    // Only allow deleting user-created presets
    if (!id.startsWith("user_")) {
      return NextResponse.json(
        { error: "Cannot delete predefined presets" },
        { status: 403 }
      );
    }

    // Delete medicines first (foreign key constraint)
    await db.delete(medicines).where(eq(medicines.prescriptionId, id));

    // Delete the prescription
    await db.delete(prescriptions).where(eq(prescriptions.id, id));

    return NextResponse.json(
      { message: "Preset deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting preset:", error);
    return NextResponse.json(
      { error: "Failed to delete preset" },
      { status: 500 }
    );
  }
}
