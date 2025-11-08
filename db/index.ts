import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and, or, like } from "drizzle-orm";
import {
  prescriptions,
  medicines,
  prescriptionsRelations,
  medicinesRelations,
  type Prescription,
  type NewPrescription,
  type Medicine,
  type NewMedicine,
} from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be a Neon postgres connection string");
}

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, {
  schema: {
    prescriptions,
    medicines,
    prescriptionsRelations,
    medicinesRelations,
  },
});

export type { Prescription, NewPrescription, Medicine, NewMedicine };
export { prescriptions, medicines };

export const dbUtils = {
  async getPrescriptionsWithMedicines(userId: string, limit = 50) {
    const result = await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.userId, userId))
      .leftJoin(medicines, eq(prescriptions.id, medicines.prescriptionId))
      .orderBy(prescriptions.createdAt)
      .limit(limit);

    const grouped = result.reduce((acc, row) => {
      const prescription = row.prescriptions;
      const medicine = row.medicines;

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

    return Object.values(grouped);
  },

  async getPrescriptionWithMedicines(prescriptionId: string) {
    const result = await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.id, prescriptionId))
      .leftJoin(medicines, eq(prescriptions.id, medicines.prescriptionId));

    if (result.length === 0) return null;

    const prescription = {
      ...result[0].prescriptions,
      medicines: result
        .filter((row) => row.medicines)
        .map((row) => row.medicines),
    };

    return prescription;
  },

  async searchPrescriptions(userId: string, searchTerm: string) {
    const result = await db
      .select()
      .from(prescriptions)
      .where(
        and(
          eq(prescriptions.userId, userId),
          or(
            like(prescriptions.patientName, `%${searchTerm}%`),
            like(prescriptions.diagnosis, `%${searchTerm}%`)
          )
        )
      )
      .leftJoin(medicines, eq(prescriptions.id, medicines.prescriptionId))
      .orderBy(prescriptions.createdAt);

    const grouped = result.reduce((acc, row) => {
      const prescription = row.prescriptions;
      const medicine = row.medicines;

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

    return Object.values(grouped);
  },
};
