-- drizzle/0007_make_testid_optional.sql
-- Make testId field optional in prescription_tests table

ALTER TABLE prescription_tests 
ALTER COLUMN test_id DROP NOT NULL;