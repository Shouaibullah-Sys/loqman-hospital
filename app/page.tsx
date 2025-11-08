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
      if (response.status === 401) {
        console.log("Unauthorized - returning empty array");
        return [];
      }
      if (response.status === 404) {
        console.log("Prescriptions API not found - returning empty array");
        return [];
      }
      console.log("Response not OK, status:", response.status);
      return [];
    }

    const result = await response.json();
    console.log("Prescriptions API response:", result);

    return result.data?.prescriptions || [];
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
  return <DashboardClient initialPrescriptions={initialPrescriptions} />;
}
