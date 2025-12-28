-- Remove BMI column from prescriptions table
ALTER TABLE prescriptions DROP COLUMN IF EXISTS bmi;