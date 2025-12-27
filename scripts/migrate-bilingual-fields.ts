#!/usr/bin/env node

/**
 * TypeScript migration script for adding Persian medication fields
 * Uses the existing Drizzle database connection
 */

import { sql } from "drizzle-orm";
import { db } from "../db/index";

async function runBilingualMigration() {
  try {
    console.log("🚀 Starting bilingual medication fields migration...");

    // Check if medicines table exists
    console.log("🔍 Checking medicines table...");
    const tableCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'medicines'
      ) as table_exists;
    `);

    if (!tableCheck.rows[0]?.table_exists) {
      throw new Error(
        "Medicines table does not exist. Please run initial migrations first."
      );
    }

    console.log("✅ Medicines table found");

    // Check if Persian columns already exist
    console.log("🔍 Checking for existing Persian columns...");
    const columnsCheck = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'medicines' 
      AND column_name LIKE '%_persian'
    `);

    const existingColumns = columnsCheck.rows.map((row) => row.column_name);

    if (existingColumns.length > 0) {
      console.log(
        `⚠️  Persian columns already exist: ${existingColumns.join(", ")}`
      );
      console.log("🔄 Migration may have been applied already.");

      // Still run the migration to ensure indexes are created
      console.log("📋 Proceeding to ensure indexes are in place...");
    }

    // Add Persian columns (using IF NOT EXISTS equivalent)
    console.log("📋 Adding Persian translation columns...");

    try {
      await db.execute(sql`
        ALTER TABLE medicines 
        ADD COLUMN dosage_persian TEXT
      `);
      console.log("   ✅ dosage_persian column added");
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        console.log("   ℹ️  dosage_persian column already exists");
      } else {
        throw error;
      }
    }

    try {
      await db.execute(sql`
        ALTER TABLE medicines 
        ADD COLUMN frequency_persian TEXT
      `);
      console.log("   ✅ frequency_persian column added");
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        console.log("   ℹ️  frequency_persian column already exists");
      } else {
        throw error;
      }
    }

    try {
      await db.execute(sql`
        ALTER TABLE medicines 
        ADD COLUMN duration_persian TEXT
      `);
      console.log("   ✅ duration_persian column added");
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        console.log("   ℹ️  duration_persian column already exists");
      } else {
        throw error;
      }
    }

    try {
      await db.execute(sql`
        ALTER TABLE medicines 
        ADD COLUMN instructions_persian TEXT
      `);
      console.log("   ✅ instructions_persian column added");
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        console.log("   ℹ️  instructions_persian column already exists");
      } else {
        throw error;
      }
    }

    try {
      await db.execute(sql`
        ALTER TABLE medicines 
        ADD COLUMN form_persian TEXT
      `);
      console.log("   ✅ form_persian column added");
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        console.log("   ℹ️  form_persian column already exists");
      } else {
        throw error;
      }
    }

    // Create indexes (ignore if already exist)
    console.log("📈 Creating performance indexes...");

    const indexes = [
      { name: "idx_medicines_dosage_persian", column: "dosage_persian" },
      { name: "idx_medicines_frequency_persian", column: "frequency_persian" },
      { name: "idx_medicines_duration_persian", column: "duration_persian" },
      {
        name: "idx_medicines_instructions_persian",
        column: "instructions_persian",
      },
      { name: "idx_medicines_form_persian", column: "form_persian" },
    ];

    for (const index of indexes) {
      try {
        await db.execute(sql`
          CREATE INDEX ${sql.raw(index.name)} ON medicines(${sql.raw(
          index.column
        )})
        `);
        console.log(`   ✅ ${index.name} index created`);
      } catch (error: any) {
        if (error.message.includes("already exists")) {
          console.log(`   ℹ️  ${index.name} index already exists`);
        } else {
          console.warn(`   ⚠️  Failed to create ${index.name}:`, error.message);
        }
      }
    }

    // Verify the migration
    console.log("🔍 Verifying migration...");
    const verification = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'medicines' 
      AND column_name LIKE '%_persian'
      ORDER BY column_name
    `);

    console.log("📊 Persian columns in medicines table:");
    verification.rows.forEach((row) => {
      console.log(
        `   • ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`
      );
    });

    // Check indexes
    const indexVerification = await db.execute(sql`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'medicines' 
      AND indexname LIKE '%_persian'
      ORDER BY indexname
    `);

    if (indexVerification.rows.length > 0) {
      console.log("📈 Persian indexes created:");
      indexVerification.rows.forEach((row) => {
        console.log(`   • ${row.indexname}`);
      });
    }

    console.log("");
    console.log("🎉 Bilingual migration completed successfully!");
    console.log("");
    console.log("📋 Summary:");
    console.log("   • Added 5 Persian translation columns to medicines table");
    console.log("   • Created performance indexes for fast queries");
    console.log("   • Database schema updated and ready");
    console.log("");
    console.log("🔄 Next steps:");
    console.log("   1. Restart your development server (npm run dev)");
    console.log("   2. Test the bilingual form inputs");
    console.log("   3. Generate PDFs with Persian content");
    console.log(
      "   4. The forms will now show English/Persian language toggles"
    );
  } catch (error) {
    console.error("❌ Migration failed:", error);
    console.log("");
    console.log("🔧 Troubleshooting:");
    console.log("   • Ensure DATABASE_URL is set in .env.local");
    console.log("   • Check database connectivity");
    console.log("   • Verify you have ALTER TABLE permissions");
    console.log("   • Make sure the medicines table exists");
    process.exit(1);
  }
}

// Run the migration
runBilingualMigration();
