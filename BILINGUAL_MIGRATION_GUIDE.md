# Bilingual Medication Fields Migration Guide

This guide explains how to apply the database migration for bilingual (English/Persian) medication field support.

## 📋 Migration Overview

The migration adds Persian translation fields to the `medicines` table to support bilingual prescriptions:

- `dosage_persian` - Persian translation of dosage
- `frequency_persian` - Persian translation of frequency
- `duration_persian` - Persian translation of duration
- `instructions_persian` - Persian translation of instructions
- `form_persian` - Persian translation of form

## 🚀 Migration Methods

### Method 1: Automatic Migration (Recommended)

Run the migration script:

```bash
# Make the script executable (Unix/Linux/Mac)
chmod +x scripts/apply-bilingual-migration.js

# Run the migration
node scripts/apply-bilingual-migration.js
```

### Method 2: Manual Drizzle Migration

```bash
# Generate and apply migrations
npx drizzle-kit migrate

# Or generate migrations only
npx drizzle-kit generate
```

### Method 3: Direct SQL Execution

If you have direct database access, run the SQL file:

```sql
-- Execute this in your PostgreSQL database
\i drizzle/0005_add_persian_medication_fields.sql
```

## 📁 Migration Files Created

1. **`drizzle/0005_add_persian_medication_fields.sql`** - SQL migration script
2. **`drizzle/meta/0005_snapshot.json`** - Drizzle snapshot file
3. **`drizzle/meta/_journal.json`** - Updated migration journal
4. **`scripts/apply-bilingual-migration.js`** - Migration automation script

## ✅ Verification Steps

After applying the migration, verify the changes:

```sql
-- Check if columns were added
\d medicines

-- Verify indexes were created
\di medicines_*_persian_idx

-- Test with sample data (optional)
INSERT INTO medicines (id, prescription_id, medicine, dosage, dosage_persian)
VALUES ('test-1', 'presc-1', 'Aspirin', '500mg', '۵۰۰ میلی‌گرم');
```

## 🔧 Post-Migration Steps

1. **Restart Development Server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. **Test Bilingual Features**

   - Open the prescription form
   - Add medications with both English and Persian values
   - Generate PDFs with different language settings

3. **Verify TypeScript Types**
   ```bash
   npm run type-check
   ```

## 🎯 New Features Available

### Form Usage

- **Bilingual Inputs**: Each medication field now has English/Persian toggle
- **Auto-Translation**: Common medical terms auto-translate
- **Visual Preview**: See both language values side-by-side

### PDF Generation

- **Language Preference**: Configure primary language for PDFs
- **Bilingual Display**: Option to show both English and Persian
- **Auto-Detection**: Automatically detects content language

### Example Usage

```typescript
// Form: Enter bilingual medication data
const medication = {
  medicine: "Aspirin",
  dosage: "500mg",
  dosagePersian: "۵۰۰ میلی‌گرم",
  frequency: "once_daily",
  frequencyPersian: "روزی یک بار",
};

// PDF: Generate with Persian preference
generatePrescriptionPDF(prescription, {
  language: {
    primary: "persian",
    showBothLanguages: false,
  },
});
```

## 🔄 Backward Compatibility

- **Existing Data**: All existing prescriptions continue to work
- **Empty Persian Fields**: System falls back to English when Persian is missing
- **API Compatibility**: No breaking changes to existing APIs

## 🐛 Troubleshooting

### Migration Fails

```bash
# Check database connection
npx drizzle-kit check

# Reset migration state if needed
# (Warning: This will remove all migration history)
rm drizzle/meta/_journal.json
```

### Type Errors

```bash
# Regenerate types
npx drizzle-kit generate
npm run build
```

### Persian Text Not Displaying

- Ensure database supports UTF-8 encoding
- Check font support for Persian characters in PDFs
- Verify RTL text direction in UI components

## 📞 Support

If you encounter issues:

1. Check the migration logs for specific errors
2. Verify database permissions for ALTER TABLE operations
3. Ensure Drizzle Kit is properly configured
4. Test with a fresh database copy if needed

---

**Migration Version**: 0005_add_persian_medication_fields  
**Applied**: Ready for deployment  
**Breaking Changes**: None (fully backward compatible)
