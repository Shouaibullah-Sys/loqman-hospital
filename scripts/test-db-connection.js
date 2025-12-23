#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Tests the connection to NeonDB and provides diagnostic information
 */

import "dotenv/config";

async function testDatabaseConnection() {
  console.log("🧪 Testing Database Connection...\n");

  // Test 1: Check environment variables
  console.log("📋 Environment Check:");
  console.log(
    "DATABASE_URL:",
    process.env.DATABASE_URL ? "✅ Set" : "❌ Missing"
  );
  console.log("");

  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set in .env.local");
    process.exit(1);
  }

  // Test 2: Test connection using fetch (like Neon HTTP client)
  console.log("🔌 Testing Connection...");
  try {
    const connectionString = process.env.DATABASE_URL;
    console.log(
      "Connection string format:",
      connectionString.substring(0, 50) + "..."
    );

    // Parse the connection string
    const url = new URL(connectionString);
    console.log("Host:", url.hostname);
    console.log("Database:", url.pathname.substring(1));
    console.log("SSL Required:", url.searchParams.get("sslmode") === "require");

    // Test basic connectivity
    const testUrl = new URL(connectionString);
    testUrl.searchParams.set("connection_timeout", "5");

    console.log("\n⏱️  Testing connection with 5s timeout...");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(testUrl.toString(), {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      console.log("✅ Connection successful!");
      console.log("Status:", response.status);
      console.log("Status Text:", response.statusText);
    } else {
      console.log(
        "⚠️  Connection response:",
        response.status,
        response.statusText
      );
    }
  } catch (error) {
    console.error("❌ Connection failed:", error.message);

    if (error.name === "AbortError") {
      console.error(
        "🔴 Connection timeout - Database may be paused or unreachable"
      );
    } else if (error.code === "ENOTFOUND") {
      console.error("🔴 DNS resolution failed - Check database URL");
    } else if (error.code === "ECONNREFUSED") {
      console.error("🔴 Connection refused - Database may be down");
    } else if (error.message.includes("fetch")) {
      console.error(
        "🔴 Network error - Check internet connection and firewall"
      );
    }

    console.log("\n🔧 Troubleshooting Steps:");
    console.log(
      "1. Check if NeonDB project is paused (log into Neon dashboard)"
    );
    console.log("2. Verify DATABASE_URL in .env.local is correct");
    console.log("3. Test connection from Neon dashboard SQL editor");
    console.log("4. Check if IP is allowed (Neon automatically handles this)");
    console.log("5. Try regenerating the database connection string");

    process.exit(1);
  }

  console.log("\n🎉 Database connection test completed!");
}

// Run the test
testDatabaseConnection().catch((error) => {
  console.error("Test failed:", error);
  process.exit(1);
});
