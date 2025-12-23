// app/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/dashboard-client";
import { Prescription } from "@/types/prescription";
import { db, dbQuery, checkDatabaseConnection } from "@/db/index";
import { prescriptions, medicines } from "@/db/schema";
import { eq, inArray, desc } from "drizzle-orm";

export default async function HomePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch initial prescriptions on server side for better UX
  let initialPrescriptions: Prescription[] = [];
  let databaseStatus: "connected" | "disconnected" | "error" | "unknown" =
    "unknown";

  try {
    // First check database connectivity
    const connectionCheck = await checkDatabaseConnection();

    if (!connectionCheck.healthy) {
      console.warn("Database connection failed:", connectionCheck.error);
      databaseStatus = "disconnected" as const;
      // Continue with empty array if database is unavailable
    } else {
      databaseStatus = "connected" as const;

      // Use enhanced query with retry logic
      const prescriptionsData = await dbQuery(async () => {
        return await db
          .select({
            prescription: prescriptions,
            medicine: medicines,
          })
          .from(prescriptions)
          .where(eq(prescriptions.userId, userId))
          .leftJoin(medicines, eq(prescriptions.id, medicines.prescriptionId))
          .orderBy(desc(prescriptions.createdAt))
          .limit(50); // Limit initial load
      });

      // Group prescriptions with their medicines
      const groupedPrescriptions = prescriptionsData.reduce(
        (acc: Record<string, Prescription & { medicines: any[] }>, row) => {
          const prescription = row.prescription;
          const medicine = row.medicine;

          if (!acc[prescription.id]) {
            // Transform prescription to match Prescription interface, handling null dates
            acc[prescription.id] = {
              ...prescription,
              prescriptionDate: prescription.prescriptionDate ?? new Date(),
              createdAt: prescription.createdAt ?? new Date(),
              updatedAt: prescription.updatedAt ?? new Date(),
              medicines: [],
            };
          }

          if (medicine) {
            acc[prescription.id].medicines.push(medicine);
          }

          return acc;
        },
        {}
      );

      initialPrescriptions = Object.values(groupedPrescriptions);
    }
  } catch (error) {
    console.error("Error fetching initial prescriptions:", error);
    databaseStatus = "error" as const;
    // Continue with empty array if fetch fails
  }

  // Log database status for debugging
  console.log(
    `Database status: ${databaseStatus}, Prescriptions loaded: ${initialPrescriptions.length}`
  );

  return (
    <DashboardClient
      initialPrescriptions={initialPrescriptions}
      databaseStatus={
        databaseStatus as "connected" | "disconnected" | "error" | "unknown"
      }
    />
  );
}
