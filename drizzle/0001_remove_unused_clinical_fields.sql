-- Migration: Remove unused clinical fields from prescriptions table
-- This migration removes the fields that were removed from the form UI

ALTER TABLE prescriptions 
DROP COLUMN IF EXISTS history_of_present_illness,
DROP COLUMN IF EXISTS physical_examination, 
DROP COLUMN IF EXISTS differential_diagnosis;