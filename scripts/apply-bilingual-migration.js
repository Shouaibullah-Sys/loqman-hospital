#!/usr/bin/env node

/**
 * Script to apply the bilingual medication fields migration
 * This script adds Persian translation fields to the medicines table
 */

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function applyMigration() {
  console.log("🚀 Starting bilingual medication fields migration...");

  try {
    // Run the Drizzle migration command
    console.log("📦 Running database migration...");
    const { stdout, stderr } = await execAsync("npx drizzle-kit migrate");

    if (stdout) {
      console.log("✅ Migration output:", stdout);
    }

    if (stderr) {
      console.log("⚠️  Migration warnings:", stderr);
    }

    console.log("🎉 Migration completed successfully!");
    console.log("");
    console.log("📋 Summary of changes:");
    console.log("   • Added dosage_persian column to medicines table");
    console.log("   • Added frequency_persian column to medicines table");
    console.log("   • Added duration_persian column to medicines table");
    console.log("   • Added instructions_persian column to medicines table");
    console.log("   • Added form_persian column to medicines table");
    console.log("   • Created indexes for better query performance");
    console.log("");
    console.log("🔧 Next steps:");
    console.log("   1. Restart your development server");
    console.log("   2. Test the bilingual form inputs");
    console.log("   3. Generate PDFs with Persian content");
    console.log("");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    console.log("");
    console.log("🔧 Manual migration option:");
    console.log("   You can manually run the SQL migration file:");
    console.log("   drizzle/0005_add_persian_medication_fields.sql");
    console.log("");
    process.exit(1);
  }
}

// Run the migration
applyMigration();
