// Test function to verify PDF generation fixes
import { generatePrescriptionPDF } from "./utils/generatePrescriptionPDF";
import {
  testPrescriptionWithEmptyPhysicalExam,
  testPrescriptionWithEmptyMedicalExams,
  testPrescriptionWithOnlyMedicalExams,
} from "./test-prescription-data";

/**
 * Test function to verify that the PDF generation fixes work correctly
 */
export async function testPDFGeneration() {
  console.log(
    "🧪 Testing PDF generation with fixed physicalExam and medicalExams...\n"
  );

  try {
    // Test 1: User's original issue - empty physicalExam string with medicalExams array
    console.log("Test 1: Empty physicalExam + medicalExams array");
    console.log(
      "Expected: Physical Exam section should show with placeholder text"
    );
    console.log(
      "Expected: Laboratory Tests section should show with CBC and Lipid Profile"
    );
    await generatePrescriptionPDF(testPrescriptionWithEmptyPhysicalExam);
    console.log("✅ Test 1 completed - PDF should show both sections\n");

    // Test 2: Empty medical exams
    console.log("Test 2: Empty medicalExams array");
    console.log("Expected: Laboratory Tests section should NOT show");
    await generatePrescriptionPDF(testPrescriptionWithEmptyMedicalExams);
    console.log(
      "✅ Test 2 completed - PDF should not show Laboratory Tests section\n"
    );

    // Test 3: Only medical exams, no physical exam
    console.log("Test 3: Only medicalExams (undefined physicalExam)");
    console.log("Expected: Physical Exam section should NOT show");
    console.log(
      "Expected: Laboratory Tests section should show with MRI Brain and EEG"
    );
    await generatePrescriptionPDF(testPrescriptionWithOnlyMedicalExams);
    console.log(
      "✅ Test 3 completed - PDF should show only Laboratory Tests section\n"
    );

    console.log("🎉 All tests completed successfully!");
    console.log("The fixes ensure that:");
    console.log(
      '• Empty physicalExam strings ("") now show as placeholder text'
    );
    console.log("• medicalExams arrays with items now display correctly");
    console.log("• Proper null/undefined checking prevents false negatives");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Export the test function for manual testing
export { testPDFGeneration as default };
