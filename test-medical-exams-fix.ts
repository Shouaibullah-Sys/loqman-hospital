// test-medical-exams-fix.ts
import { db, checkDatabaseConnection } from "./db/index";
import { prescriptions, prescriptionTests } from "./db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

async function testMedicalExamsFix() {
  console.log("Testing medical exams fix...");

  // Check database connection
  const connectionCheck = await checkDatabaseConnection();
  if (!connectionCheck.healthy) {
    console.error("Database connection failed:", connectionCheck.error);
    return;
  }

  // Create a test prescription with medical exams
  const testPrescriptionId = uuidv4();
  const testUserId = "test-user-" + Date.now();

  const testPrescription = {
    id: testPrescriptionId,
    userId: testUserId,
    patientName: "Test Patient",
    patientAge: "35",
    patientGender: "Male",
    patientPhone: "0703022036",
    chiefComplaint: "Test complaint",
    pulseRate: "72",
    heartRate: "72",
    bloodPressure: "120/80",
    temperature: "",
    respiratoryRate: "16",
    oxygenSaturation: "98",
    weight: "70",
    height: "175",
    allergies: ["aspirin"],
    currentMedications: ["aspirin"],
    pastMedicalHistory: "good",
    familyHistory: "good",
    socialHistory: "",
    physicalExam: "Normal physical exam",
    medicalExams: ["Complete Blood Count (CBC)", "Lipid Profile"],
    examNotes: "Test exam notes",
    instructions: "Test instructions",
    followUp: "Return if needed",
    restrictions: "",
    doctorName: "Dr. Test Doctor",
    doctorFree: "500",
    clinicName: "Test Clinic",
    prescriptionDate: new Date(),
    source: "test",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    console.log("Creating test prescription...");

    // Insert test prescription
    await db.insert(prescriptions).values(testPrescription);
    console.log("✓ Test prescription created successfully");

    // Create prescription tests
    const medicalExams = testPrescription.medicalExams as string[];
    if (medicalExams.length > 0) {
      console.log("Creating prescription tests for:", medicalExams);

      const prescriptionTestsData = medicalExams.map((examName: string) => ({
        id: uuidv4(),
        prescriptionId: testPrescriptionId,
        testName: examName,
        notes: "Test exam notes",
        priority: "routine",
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      await db.insert(prescriptionTests).values(prescriptionTestsData);
      console.log("✓ Prescription tests created successfully");
    }

    // Verify the data was saved correctly
    console.log("Verifying saved data...");

    // Check prescription
    const savedPrescription = await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.id, testPrescriptionId))
      .limit(1);

    if (savedPrescription.length === 0) {
      console.error("✗ Prescription not found in database");
      return;
    }

    console.log("✓ Prescription found in database");
    console.log(
      "Medical exams in prescription:",
      savedPrescription[0].medicalExams
    );

    // Check prescription tests
    const savedTests = await db
      .select()
      .from(prescriptionTests)
      .where(eq(prescriptionTests.prescriptionId, testPrescriptionId));

    console.log("✓ Found", savedTests.length, "prescription tests");
    console.log(
      "Test names:",
      savedTests.map((t) => t.testName)
    );

    // Verify the data matches what we inserted
    const prescriptionExams = savedPrescription[0].medicalExams || [];
    const testExams = savedTests.map((t) => t.testName);

    if (
      JSON.stringify(prescriptionExams.sort()) ===
        JSON.stringify(medicalExams.sort()) &&
      JSON.stringify(testExams.sort()) === JSON.stringify(medicalExams.sort())
    ) {
      console.log("✓ All medical exams saved correctly in both tables!");
    } else {
      console.error("✗ Medical exams data mismatch");
      console.log("Expected:", medicalExams);
      console.log("Prescription exams:", prescriptionExams);
      console.log("Test exams:", testExams);
    }

    // Clean up test data
    console.log("Cleaning up test data...");
    await db
      .delete(prescriptionTests)
      .where(eq(prescriptionTests.prescriptionId, testPrescriptionId));
    await db
      .delete(prescriptions)
      .where(eq(prescriptions.id, testPrescriptionId));
    console.log("✓ Test data cleaned up");
  } catch (error) {
    console.error("✗ Test failed:", error);
  }
}

testMedicalExamsFix()
  .then(() => {
    console.log("Test completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test error:", error);
    process.exit(1);
  });
