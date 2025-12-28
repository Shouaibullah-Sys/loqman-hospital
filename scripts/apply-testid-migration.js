// scripts/apply-testid-migration.js
const { createClient } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

async function applyTestIdMigration() {
  const client = createClient({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("Connecting to database...");
    await client.connect();

    console.log("Making testId optional in prescription_tests table...");
    await client.query(
      "ALTER TABLE prescription_tests ALTER COLUMN test_id DROP NOT NULL;"
    );

    console.log("✓ Migration applied successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await client.end();
    console.log("Database connection closed");
  }
}

applyTestIdMigration()
  .then(() => {
    console.log("Migration completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
