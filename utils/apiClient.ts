// utils/apiClient.ts
import Fuse from "fuse.js";
import { Prescription, AutocompleteResponse } from "../types/prescription";

const API_BASE = "/api";

/**
 * Smart autocomplete system with fuzzy matching
 * Supports bilingual (Persian/English) medical suggestions
 */

const LOCAL_SUGGESTIONS = {
  symptoms: [
    "سرفه خشک",
    "تب بالا",
    "گلودرد",
    "ضعف عمومی",
    "سرگیجه",
    "سردرد مداوم",
    "حالت تهوع",
    "تنگی نفس",
    "درد قفسه سینه",
    "بی‌خوابی",
    "از دست دادن اشتها",
    "درد مفصل",
    "دل‌درد",
    "اسهال",
    "استفراغ",
    "خستگی مزمن",
    "عرق شبانه",
    "درد عضله",
  ],
  diagnoses: [
    "سرماخوردگی",
    "آنفولانزا",
    "سینوزیت",
    "برونشیت",
    "پنومونیا (سینه بغل)",
    "آلرژی فصلی",
    "گاستریت (التهاب معده)",
    "عفونت ادراری",
    "دیابت نوع دو",
    "فشار خون بالا",
    "کم‌خونی",
    "میکروب معده",
    "کووید-۱۹",
  ],
  medications: [
    "Paracetamol 500mg",
    "Amoxicillin 500mg",
    "Cefixime 200mg",
    "Azithromycin 250mg",
    "Ibuprofen 400mg",
    "Omeprazole 20mg",
    "Metformin 500mg",
    "Losartan 50mg",
    "Cetrizine 10mg",
    "Vitamin D3 1000IU",
    "Salbutamol Inhaler",
    "Betadine Gargle",
    "ORS Sachet",
    "Acetaminophen Syrup",
  ],
  instructions: [
    "هر ۸ ساعت یک عدد بعد از غذا",
    "روزانه یک عدد بعد از ناهار",
    "صبح و شب قبل از خواب",
    "در صورت تب یا درد استفاده شود",
    "به مدت ۵ روز متوالی مصرف شود",
    "در صورت بروز حساسیت قطع گردد",
    "با یک لیوان آب مصرف شود",
  ],
};

// Build a large combined dataset for fuzzy search
const ALL_LOCAL = Object.values(LOCAL_SUGGESTIONS).flat();
const fuse = new Fuse(ALL_LOCAL, {
  includeScore: true,
  threshold: 0.4, // allows partial matches
  distance: 100,
  minMatchCharLength: 2,
});

export async function getAutocompleteSuggestions(
  text: string
): Promise<string[]> {
  if (!text || text.length < 2) return [];

  try {
    const response = await fetch(`${API_BASE}/autocomplete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      console.warn(`Remote autocomplete failed, using fallback.`);
      return getFallbackSuggestions(text);
    }

    const data: AutocompleteResponse = await response.json();
    return (data?.suggestions || []).length > 0
      ? data.suggestions
      : getFallbackSuggestions(text);
  } catch (error) {
    console.error("Autocomplete network error:", error);
    return getFallbackSuggestions(text);
  }
}

function getFallbackSuggestions(text: string): string[] {
  const fuseResults = fuse
    .search(text)
    .slice(0, 10)
    .map((r) => r.item);
  if (fuseResults.length > 0) return fuseResults;

  // fallback simple contains match if Fuse fails
  const input = text.toLowerCase();
  return ALL_LOCAL.filter((s) => s.toLowerCase().includes(input)).slice(0, 10);
}

// ----------------------- Prescription Generator -----------------------
export async function generatePrescription(
  text: string
): Promise<Prescription> {
  try {
    const response = await fetch(`${API_BASE}/suggest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: "Unknown error occurred" };
      }
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error in generatePrescription:", error);
    throw error;
  }
}

export async function getPresetPrescriptions(): Promise<{
  [key: string]: Prescription;
}> {
  try {
    const response = await fetch(`${API_BASE}/presets`);
    if (!response.ok)
      throw new Error(`Failed to get presets: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error in getPresetPrescriptions:", error);
    return {};
  }
}
