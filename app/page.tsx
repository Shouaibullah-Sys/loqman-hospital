// app/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/dashboard-client";
import { Prescription } from "@/types/prescription";

async function getPrescriptions(): Promise<Prescription[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    console.log("Fetching prescriptions from:", `${baseUrl}/api/prescriptions`);

    const response = await fetch(`${baseUrl}/api/prescriptions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      console.log("Response not OK, status:", response.status);
      return [];
    }

    const result = await response.json();
    console.log("Prescriptions API response:", result);

    // Handle both response formats
    if (result.data && Array.isArray(result.data.prescriptions)) {
      return result.data.prescriptions;
    } else if (Array.isArray(result.prescriptions)) {
      return result.prescriptions;
    } else if (Array.isArray(result.data)) {
      return result.data;
    } else if (Array.isArray(result)) {
      return result;
    }

    console.log("No prescriptions array found in response");
    return [];
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    return [];
  }
}

export default async function HomePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const initialPrescriptions = await getPrescriptions();
  console.log("Initial prescriptions count:", initialPrescriptions.length);

  return <DashboardClient initialPrescriptions={initialPrescriptions} />;
}
