import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and, or, like } from "drizzle-orm";
import {
  prescriptions,
  medicines,
  prescriptionsRelations,
  medicinesRelations,
  type Prescription,
  type NewPrescription,
  type Medicine,
  type NewMedicine,
} from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be a Neon postgres connection string");
}

// Enhanced connection configuration with timeout and retry logic
const createConnection = () => {
  const connectionString = process.env.DATABASE_URL!;

  // Parse the connection string to add connection parameters
  const url = new URL(connectionString);

  // Add connection timeout and retry parameters
  url.searchParams.set("connection_timeout", "30"); // 30 seconds (increased for Neon resume time)
  url.searchParams.set("pool_timeout", "60"); // 60 seconds
  url.searchParams.set("statement_timeout", "120"); // 120 seconds
  url.searchParams.set("idle_timeout", "300"); // 5 minutes

  return neon(url.toString());
};

let sql = createConnection();

export const db = drizzle(sql, {
  schema: {
    prescriptions,
    medicines,
    prescriptionsRelations,
    medicinesRelations,
  },
});

// Connection health check with extended timeout for Neon resume
export const checkDatabaseConnection = async () => {
  try {
    const result = await sql`SELECT 1 as health_check`;
    return { healthy: true, result };
  } catch (error) {
    console.error("Database connection failed:", error);
    // Try to recreate connection with longer timeout for Neon resume
    try {
      // Create connection with even longer timeout for resume
      const resumeConnection = () => {
        const connectionString = process.env.DATABASE_URL!;
        const url = new URL(connectionString);
        url.searchParams.set("connection_timeout", "60"); // 60 seconds for resume
        url.searchParams.set("pool_timeout", "120"); // 120 seconds
        url.searchParams.set("statement_timeout", "180"); // 180 seconds
        url.searchParams.set("idle_timeout", "300");
        return neon(url.toString());
      };

      sql = resumeConnection();
      const result = await sql`SELECT 1 as health_check`;
      return { healthy: true, result, reconnected: true };
    } catch (retryError) {
      console.error("Database reconnection failed:", retryError);
      return { healthy: false, error: retryError };
    }
  }
};

// Enhanced query function with retry logic
export const dbQuery = async <T>(
  queryFn: () => Promise<T>,
  maxRetries = 3
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await queryFn();
    } catch (error: any) {
      lastError = error;

      // If it's a connection error, try to reconnect
      if (
        error?.cause?.code === "ETIMEDOUT" ||
        error?.message?.includes("fetch failed") ||
        error?.message?.includes("connection")
      ) {
        console.warn(
          `Database query attempt ${attempt} failed, retrying...`,
          error.message
        );

        if (attempt < maxRetries) {
          // Recreate connection before retry with longer timeout for Neon resume
          try {
            const resumeConnection = () => {
              const connectionString = process.env.DATABASE_URL!;
              const url = new URL(connectionString);
              url.searchParams.set(
                "connection_timeout",
                attempt === 1 ? "60" : "30"
              ); // Longer timeout for first attempt
              url.searchParams.set("pool_timeout", "120");
              url.searchParams.set("statement_timeout", "180");
              url.searchParams.set("idle_timeout", "300");
              return neon(url.toString());
            };
            sql = resumeConnection();
          } catch (reconnectError) {
            console.error("Failed to recreate connection:", reconnectError);
          }

          // Wait before retry (longer wait for first attempt)
          const waitTime =
            attempt === 1 ? 5000 : Math.pow(2, attempt - 1) * 1000;
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          continue;
        }
      }

      // For non-timeout errors, don't retry
      throw error;
    }
  }

  throw lastError;
};

export type { Prescription, NewPrescription, Medicine, NewMedicine };
export { prescriptions, medicines };

export const dbUtils = {
  async getPrescriptionsWithMedicines(userId: string, limit = 50) {
    const result = await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.userId, userId))
      .leftJoin(medicines, eq(prescriptions.id, medicines.prescriptionId))
      .orderBy(prescriptions.createdAt)
      .limit(limit);

    const grouped = result.reduce((acc, row) => {
      const prescription = row.prescriptions;
      const medicine = row.medicines;

      if (!acc[prescription.id]) {
        acc[prescription.id] = {
          ...prescription,
          medicines: [],
        };
      }

      if (medicine) {
        acc[prescription.id].medicines.push(medicine);
      }

      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped);
  },

  async getPrescriptionWithMedicines(prescriptionId: string) {
    const result = await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.id, prescriptionId))
      .leftJoin(medicines, eq(prescriptions.id, medicines.prescriptionId));

    if (result.length === 0) return null;

    const prescription = {
      ...result[0].prescriptions,
      medicines: result
        .filter((row) => row.medicines)
        .map((row) => row.medicines),
    };

    return prescription;
  },

  async searchPrescriptions(userId: string, searchTerm: string) {
    const result = await db
      .select()
      .from(prescriptions)
      .where(
        and(
          eq(prescriptions.userId, userId),
          or(like(prescriptions.patientName, `%${searchTerm}%`))
        )
      )
      .leftJoin(medicines, eq(prescriptions.id, medicines.prescriptionId))
      .orderBy(prescriptions.createdAt);

    const grouped = result.reduce((acc, row) => {
      const prescription = row.prescriptions;
      const medicine = row.medicines;

      if (!acc[prescription.id]) {
        acc[prescription.id] = {
          ...prescription,
          medicines: [],
        };
      }

      if (medicine) {
        acc[prescription.id].medicines.push(medicine);
      }

      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped);
  },
};
