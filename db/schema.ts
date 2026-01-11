// db/schema.ts
import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Prescriptions table
export const prescriptions = pgTable("prescriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(), // Clerk user ID

  // Patient Information ONLY
  patientName: text("patient_name").notNull(),
  patientAge: text("patient_age"),
  patientGender: text("patient_gender"),
  patientPhone: text("patient_phone"),
  patientAddress: text("patient_address"),

  // System Fields
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Medicines table
export const medicines = pgTable("medicines", {
  id: text("id").primaryKey(),
  prescriptionId: text("prescription_id").notNull(),

  // Medicine Information
  medicine: text("medicine").notNull(),
  dosage: text("dosage").notNull(),
  dosagePersian: text("dosage_persian"),
  form: text("form"),
  formPersian: text("form_persian"),
  frequency: text("frequency"),
  frequencyPersian: text("frequency_persian"),
  duration: text("duration"),
  durationPersian: text("duration_persian"),
  route: text("route"),
  timing: text("timing"),
  withFood: boolean("with_food").default(false),

  // Additional Information
  instructions: text("instructions"),
  instructionsPersian: text("instructions_persian"),
  notes: text("notes"),

  // System Fields
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Define relationships
export const prescriptionsRelations = relations(prescriptions, ({ many }) => ({
  medicines: many(medicines),
}));

export const medicinesRelations = relations(medicines, ({ one }) => ({
  prescription: one(prescriptions, {
    fields: [medicines.prescriptionId],
    references: [prescriptions.id],
  }),
}));

// Export types for easy importing
export type Prescription = typeof prescriptions.$inferSelect;
export type NewPrescription = typeof prescriptions.$inferInsert;
export type Medicine = typeof medicines.$inferSelect;
export type NewMedicine = typeof medicines.$inferInsert;
