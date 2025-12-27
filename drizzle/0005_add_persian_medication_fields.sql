-- Migration: Add Persian medication fields
-- Description: Adds Persian translation fields to medicines table for bilingual support

-- Add Persian columns to existing medicines table
ALTER TABLE medicines 
ADD COLUMN IF NOT EXISTS dosage_persian TEXT,
ADD COLUMN IF NOT EXISTS frequency_persian TEXT,
ADD COLUMN IF NOT EXISTS duration_persian TEXT,
ADD COLUMN IF NOT EXISTS instructions_persian TEXT,
ADD COLUMN IF NOT EXISTS form_persian TEXT;

-- Add indexes for better query performance (ignore if already exists)
DO $
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_medicines_dosage_persian') THEN
        CREATE INDEX idx_medicines_dosage_persian ON medicines(dosage_persian);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_medicines_frequency_persian') THEN
        CREATE INDEX idx_medicines_frequency_persian ON medicines(frequency_persian);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_medicines_duration_persian') THEN
        CREATE INDEX idx_medicines_duration_persian ON medicines(duration_persian);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_medicines_instructions_persian') THEN
        CREATE INDEX idx_medicines_instructions_persian ON medicines(instructions_persian);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_medicines_form_persian') THEN
        CREATE INDEX idx_medicines_form_persian ON medicines(form_persian);
    END IF;
END $;

-- Add comments for documentation
COMMENT ON COLUMN medicines.dosage_persian IS 'Persian translation of dosage field';
COMMENT ON COLUMN medicines.frequency_persian IS 'Persian translation of frequency field';
COMMENT ON COLUMN medicines.duration_persian IS 'Persian translation of duration field';
COMMENT ON COLUMN medicines.instructions_persian IS 'Persian translation of instructions field';
COMMENT ON COLUMN medicines.form_persian IS 'Persian translation of form field';