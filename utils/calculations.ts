// utils/calculations.ts

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
 * Get BMI category and interpretation for adults with enhanced info
 */
export function getBMICategory(bmiValue: string): {
  category: string;
  color: string;
  description: string;
  riskLevel: string;
  icon: string;
} {
  const bmi = parseFloat(bmiValue);

  if (isNaN(bmi)) {
    return {
      category: "Invalid",
      color: "text-gray-500",
      description: "Please enter valid weight and height",
      riskLevel: "N/A",
      icon: "❓",
    };
  }

  if (bmi < 16) {
    return {
      category: "Severely Underweight",
      color: "text-amber-600 dark:text-amber-400",
      description: "High nutritional risk, medical attention needed",
      riskLevel: "High",
      icon: "⚠️",
    };
  } else if (bmi >= 16 && bmi < 17) {
    return {
      category: "Moderately Underweight",
      color: "text-yellow-600 dark:text-yellow-400",
      description: "Nutritional counseling recommended",
      riskLevel: "Moderate",
      icon: "📉",
    };
  } else if (bmi >= 17 && bmi < 18.5) {
    return {
      category: "Mildly Underweight",
      color: "text-yellow-500 dark:text-yellow-300",
      description: "Consider dietary improvements",
      riskLevel: "Low",
      icon: "📊",
    };
  } else if (bmi >= 18.5 && bmi < 25) {
    return {
      category: "Normal",
      color: "text-green-600 dark:text-green-400",
      description: "Healthy weight range - maintain current lifestyle",
      riskLevel: "Normal",
      icon: "✅",
    };
  } else if (bmi >= 25 && bmi < 30) {
    return {
      category: "Overweight",
      color: "text-orange-600 dark:text-orange-400",
      description: "Consider lifestyle modifications",
      riskLevel: "Increased",
      icon: "⚖️",
    };
  } else if (bmi >= 30 && bmi < 35) {
    return {
      category: "Obese Class I",
      color: "text-red-500 dark:text-red-400",
      description: "Medical evaluation recommended",
      riskLevel: "High",
      icon: "❗",
    };
  } else if (bmi >= 35 && bmi < 40) {
    return {
      category: "Obese Class II",
      color: "text-red-600 dark:text-red-500",
      description: "High risk - urgent medical consultation",
      riskLevel: "Very High",
      icon: "🚨",
    };
  } else {
    return {
      category: "Obese Class III",
      color: "text-red-700 dark:text-red-600",
      description: "Critical risk - immediate medical attention",
      riskLevel: "Critical",
      icon: "⛔",
    };
  }
}

/**
 * Calculate Ideal Body Weight (IBW) using multiple methods
 */
export function calculateIdealBodyWeight(
  heightCm: string,
  gender?: string
): {
  hamwi: string;
  devine: string;
  robinson: string;
  miller: string;
  average: string;
} {
  const height = parseFloat(heightCm);
  if (isNaN(height) || height <= 0) {
    return {
      hamwi: "",
      devine: "",
      robinson: "",
      miller: "",
      average: "",
    };
  }

  // Convert cm to inches
  const heightInInches = height / 2.54;
  const feet = Math.floor(heightInInches / 12);
  const inches = heightInInches % 12;
  const totalInches = feet * 12 + inches;

  let hamwi, devine, robinson, miller;

  // Hamwi Method (1964)
  if (gender === "Male") {
    hamwi = 48 + 2.7 * (totalInches - 60);
    devine = 50 + 2.3 * (totalInches - 60); // Devine formula
    robinson = 52 + 1.9 * (totalInches - 60); // Robinson formula
    miller = 56.2 + 1.41 * (totalInches - 60); // Miller formula
  } else {
    hamwi = 45.5 + 2.2 * (totalInches - 60);
    devine = 45.5 + 2.3 * (totalInches - 60);
    robinson = 49 + 1.7 * (totalInches - 60);
    miller = 53.1 + 1.36 * (totalInches - 60);
  }

  // Calculate average of all methods
  const average = (hamwi + devine + robinson + miller) / 4;

  return {
    hamwi: hamwi.toFixed(1),
    devine: devine.toFixed(1),
    robinson: robinson.toFixed(1),
    miller: miller.toFixed(1),
    average: average.toFixed(1),
  };
}

/**
 * Calculate Basal Metabolic Rate (BMR) using multiple equations
 */
export function calculateBMR(
  weight: string,
  height: string,
  age: string,
  gender?: string
): {
  mifflin: string;
  harrisBenedict: string;
  katchMcArdle: string;
  average: string;
} {
  const weightNum = parseFloat(weight);
  const heightNum = parseFloat(height);
  const ageNum = parseFloat(age);

  if (isNaN(weightNum) || isNaN(heightNum) || isNaN(ageNum)) {
    return {
      mifflin: "",
      harrisBenedict: "",
      katchMcArdle: "",
      average: "",
    };
  }

  let mifflin, harrisBenedict, katchMcArdle;

  // Mifflin-St Jeor Equation (most accurate for general population)
  if (gender === "Male") {
    mifflin = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;
    harrisBenedict =
      88.362 + 13.397 * weightNum + 4.799 * heightNum - 5.677 * ageNum;
  } else {
    mifflin = 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;
    harrisBenedict =
      447.593 + 9.247 * weightNum + 3.098 * heightNum - 4.33 * ageNum;
  }

  // Katch-McArdle (requires body fat % - simplified version using LBM estimate)
  // Assuming average body fat: 15% for men, 25% for women
  const bodyFatPercent = gender === "Male" ? 15 : 25;
  const leanBodyMass = weightNum * (1 - bodyFatPercent / 100);
  katchMcArdle = 370 + 21.6 * leanBodyMass;

  // Calculate average
  const average = (mifflin + harrisBenedict + katchMcArdle) / 3;

  return {
    mifflin: mifflin.toFixed(0),
    harrisBenedict: harrisBenedict.toFixed(0),
    katchMcArdle: katchMcArdle.toFixed(0),
    average: average.toFixed(0),
  };
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE) based on activity level
 */
export function calculateTDEE(
  bmr: string,
  activityLevel:
    | "sedentary"
    | "light"
    | "moderate"
    | "active"
    | "veryActive" = "sedentary"
): string {
  const bmrNum = parseFloat(bmr);
  if (isNaN(bmrNum) || bmrNum <= 0) return "";

  const activityMultipliers = {
    sedentary: 1.2, // Little or no exercise
    light: 1.375, // Light exercise 1-3 days/week
    moderate: 1.55, // Moderate exercise 3-5 days/week
    active: 1.725, // Hard exercise 6-7 days/week
    veryActive: 1.9, // Very hard exercise & physical job
  };

  const tdee = bmrNum * activityMultipliers[activityLevel];
  return tdee.toFixed(0);
}

/**
 * Calculate Body Surface Area (BSA) using multiple formulas
 */
export function calculateBodySurfaceArea(
  weight: string,
  height: string
): {
  mosteller: string;
  dubois: string;
  haycock: string;
  average: string;
} {
  const weightNum = parseFloat(weight);
  const heightNum = parseFloat(height);

  if (
    isNaN(weightNum) ||
    isNaN(heightNum) ||
    weightNum <= 0 ||
    heightNum <= 0
  ) {
    return {
      mosteller: "",
      dubois: "",
      haycock: "",
      average: "",
    };
  }

  // Mosteller formula (simple and widely used)
  // BSA (m²) = √[height (cm) × weight (kg) / 3600]
  const mosteller = Math.sqrt((heightNum * weightNum) / 3600);

  // Du Bois & Du Bois formula (historical standard)
  // BSA = 0.007184 × height^0.725 × weight^0.425
  const dubois =
    0.007184 * Math.pow(heightNum, 0.725) * Math.pow(weightNum, 0.425);

  // Haycock formula (accurate for pediatric and adult)
  // BSA = 0.024265 × height^0.3964 × weight^0.5378
  const haycock =
    0.024265 * Math.pow(heightNum, 0.3964) * Math.pow(weightNum, 0.5378);

  // Calculate average of all methods
  const average = (mosteller + dubois + haycock) / 3;

  return {
    mosteller: mosteller.toFixed(3),
    dubois: dubois.toFixed(3),
    haycock: haycock.toFixed(3),
    average: average.toFixed(3),
  };
}

/**
 * Calculate Body Fat Percentage using BMI method
 */
export function calculateBodyFatPercentage(
  age: string,
  gender?: string,
  bmi?: string
): string {
  const ageNum = parseFloat(age);
  const bmiNum = parseFloat(bmi || "0");

  if (isNaN(ageNum) || isNaN(bmiNum) || bmiNum <= 0) return "";

  // Simple BMI-based estimation (not as accurate as other methods but useful)
  if (gender === "Male") {
    return (1.2 * bmiNum + 0.23 * ageNum - 16.2).toFixed(1);
  } else {
    return (1.2 * bmiNum + 0.23 * ageNum - 5.4).toFixed(1);
  }
}

/**
 * Calculate Lean Body Mass (LBM)
 */
export function calculateLeanBodyMass(
  weight: string,
  bodyFatPercentage?: string
): string {
  const weightNum = parseFloat(weight);
  const bfpNum = parseFloat(bodyFatPercentage || "0");

  if (isNaN(weightNum) || weightNum <= 0) return "";

  if (!isNaN(bfpNum) && bfpNum > 0) {
    // If body fat percentage is provided
    const fatMass = weightNum * (bfpNum / 100);
    const lbm = weightNum - fatMass;
    return lbm.toFixed(1);
  } else {
    // Estimate using James formula
    return (weightNum * 0.85).toFixed(1); // Rough estimate
  }
}

/**
 * Calculate Waist-to-Height Ratio (WHtR)
 */
export function calculateWaistToHeightRatio(
  waistCircumference: string,
  height: string
): string {
  const waistNum = parseFloat(waistCircumference);
  const heightNum = parseFloat(height);

  if (isNaN(waistNum) || isNaN(heightNum) || waistNum <= 0 || heightNum <= 0) {
    return "";
  }

  const ratio = waistNum / heightNum;
  return ratio.toFixed(2);
}

/**
 * Calculate Adjusted Body Weight (ABW) for obese patients
 */
export function calculateAdjustedBodyWeight(
  weight: string,
  height: string,
  gender?: string
): string {
  const weightNum = parseFloat(weight);
  const heightNum = parseFloat(height);

  if (
    isNaN(weightNum) ||
    isNaN(heightNum) ||
    weightNum <= 0 ||
    heightNum <= 0
  ) {
    return "";
  }

  // Calculate IBW
  const ibw = calculateIdealBodyWeight(height, gender);
  const ibwNum = parseFloat(ibw.average || "0");

  if (ibwNum === 0) return "";

  // ABW = IBW + 0.4 × (Actual Weight − IBW)
  const abw = ibwNum + 0.4 * (weightNum - ibwNum);
  return abw.toFixed(1);
}

/**
 * Calculate Hydration Status - Daily Water Requirement
 */
export function calculateWaterRequirement(
  weight: string,
  activityLevel: "sedentary" | "active" | "athlete" = "sedentary"
): string {
  const weightNum = parseFloat(weight);
  if (isNaN(weightNum) || weightNum <= 0) return "";

  // Base water requirement: 30-35 ml per kg body weight
  let baseWater = weightNum * 32.5; // Average of 30-35

  // Adjust for activity level
  const activityMultipliers = {
    sedentary: 1.0,
    active: 1.2, // Additional 20% for active individuals
    athlete: 1.5, // Additional 50% for athletes
  };

  const totalWater = baseWater * activityMultipliers[activityLevel];
  return totalWater.toFixed(0); // in ml
}
