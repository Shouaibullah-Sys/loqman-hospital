/**
 * Calculate BMI based on weight (kg) and height (cm)
 * Formula: BMI = weight (kg) / [height (m)]²
 */
export function calculateBMI(weight: string, height: string): string {
  // Convert to numbers
  const weightNum = parseFloat(weight);
  const heightNum = parseFloat(height);

  // Validate inputs
  if (
    isNaN(weightNum) ||
    isNaN(heightNum) ||
    weightNum <= 0 ||
    heightNum <= 0
  ) {
    return "";
  }

  // Convert height from cm to meters
  const heightInMeters = heightNum / 100;

  // Calculate BMI
  const bmi = weightNum / (heightInMeters * heightInMeters);

  // Format to 1 decimal place
  return bmi.toFixed(1);
}

/**
 * Get BMI category and interpretation for adults
 */
export function getBMICategory(bmiValue: string): {
  category: string;
  color: string;
  description: string;
} {
  const bmi = parseFloat(bmiValue);

  if (isNaN(bmi)) {
    return {
      category: "Invalid",
      color: "text-gray-500",
      description: "Please enter valid weight and height",
    };
  }

  if (bmi < 18.5) {
    return {
      category: "Underweight",
      color: "text-yellow-600",
      description: "Consider nutritional support",
    };
  } else if (bmi >= 18.5 && bmi < 25) {
    return {
      category: "Normal",
      color: "text-green-600",
      description: "Healthy weight range",
    };
  } else if (bmi >= 25 && bmi < 30) {
    return {
      category: "Overweight",
      color: "text-orange-600",
      description: "Consider lifestyle changes",
    };
  } else {
    return {
      category: "Obese",
      color: "text-red-600",
      description: "Medical evaluation recommended",
    };
  }
}

/**
 * Calculate Ideal Body Weight (IBW) - Hamwi method
 * Male: 48 kg + 2.7 kg per inch over 5 feet
 * Female: 45.5 kg + 2.2 kg per inch over 5 feet
 */
export function calculateIdealBodyWeight(
  heightCm: string,
  gender?: string
): string {
  const height = parseFloat(heightCm);
  if (isNaN(height) || height <= 0) return "";

  // Convert cm to inches
  const heightInInches = height / 2.54;
  const feet = Math.floor(heightInInches / 12);
  const inches = heightInInches % 12;

  let ibw;
  if (gender === "Male") {
    ibw = 48 + 2.7 * ((feet - 5) * 12 + inches);
  } else {
    // Default to female formula
    ibw = 45.5 + 2.2 * ((feet - 5) * 12 + inches);
  }

  return ibw.toFixed(1);
}

/**
 * Calculate Basal Metabolic Rate (BMR) - Mifflin-St Jeor Equation
 */
export function calculateBMR(
  weight: string,
  height: string,
  age: string,
  gender?: string
): string {
  const weightNum = parseFloat(weight);
  const heightNum = parseFloat(height);
  const ageNum = parseFloat(age);

  if (isNaN(weightNum) || isNaN(heightNum) || isNaN(ageNum)) return "";

  if (gender === "Male") {
    return (10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5).toFixed(0);
  } else {
    return (10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161).toFixed(0);
  }
}
