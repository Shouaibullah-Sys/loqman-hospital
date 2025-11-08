//app/api/autocomplete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
    }

    const { text } = await request.json();

    if (!text || text.length < 3) {
      return NextResponse.json({ error: "Text too short" }, { status: 400 });
    }

    console.log("Autocomplete request for:", text);

    // Try Hugging Face API if available
    if (process.env.HUGGING_FACE_API_KEY) {
      try {
        const response = await fetch(
          "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              inputs: `Complete the medical symptom in Persian: ${text}. Provide 5 short suggestions:`,
              parameters: {
                max_new_tokens: 20,
                temperature: 0.7,
                return_full_text: false,
              },
            }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          const generatedText = result[0]?.generated_text || "";

          const suggestions = generatedText
            .split("\n")
            .filter((line: string) => line.trim().length > 0)
            .slice(0, 5);

          if (suggestions.length > 0) {
            return NextResponse.json({ suggestions });
          }
        }
      } catch (error) {
        console.warn("Hugging Face API failed, using local suggestions");
      }
    }

    // Fallback to local suggestions
    const localSuggestions = getLocalSuggestions(text);
    return NextResponse.json({ suggestions: localSuggestions });
  } catch (error) {
    console.error("Autocomplete API error:", error);
    // Always return local suggestions as fallback
    const { text } = await request.json().catch(() => ({ text: "" }));
    const localSuggestions = getLocalSuggestions(text || "");
    return NextResponse.json({ suggestions: localSuggestions });
  }
}

// Local fallback suggestions function
function getLocalSuggestions(inputText: string): string[] {
  const commonSuggestions = {
    سرفه: ["سرفه خشک", "سرفه خلط دار", "سرفه شدید", "سرفه شبانه", "سرفه مداوم"],
    تب: ["تب بالا", "تب خفیف", "تب مداوم", "تب با لرز", "تب شبانه"],
    گلودرد: [
      "گلودرد شدید",
      "گلودرد خفیف",
      "گلودرد با مشکل در بلع",
      "گلودرد با تورم لوزه",
    ],
    سردرد: [
      "سردرد میگرنی",
      "سردرد تنشی",
      "سردرد شدید",
      "سردرد مداوم",
      "سردرد با سرگیجه",
    ],
    بدن: ["بدن درد", "ضعف بدن", "خستگی بدن", "کوفتگی بدن"],
    معده: ["درد معده", "حالت تهوع", "استفراغ", "سوء هاضمه"],
    بینی: ["آبریزش بینی", "گرفتگی بینی", "خارش بینی", "عطسه"],
    درد: ["درد شدید", "درد مبهم", "درد تیز", "درد ضربان دار"],
    تنفس: ["تنگی نفس", "سختی تنفس", "تنفس سریع", "خس خس سینه"],
  };

  const input = inputText.toLowerCase();
  const suggestions: string[] = [];

  // Find matching categories
  Object.entries(commonSuggestions).forEach(([key, values]) => {
    if (input.includes(key)) {
      values.forEach((value) => {
        if (!suggestions.includes(value)) {
          suggestions.push(value);
        }
      });
    }
  });

  // Add general medical suggestions if no matches found
  if (suggestions.length === 0) {
    const generalSuggestions = [
      "تب بالا",
      "سرفه خشک",
      "گلودرد شدید",
      "بدن درد",
      "آبریزش بینی",
      "سردرد مداوم",
      "ضعف عمومی",
      "حالت تهوع",
      "سرگیجه",
      "بی‌اشتهایی",
    ];

    generalSuggestions.forEach((suggestion) => {
      if (
        suggestion.includes(input) ||
        input.includes(suggestion.split(" ")[0])
      ) {
        suggestions.push(suggestion);
      }
    });
  }

  // Ensure we always return some suggestions
  if (suggestions.length === 0) {
    return ["سرفه خشک", "تب بالا", "گلودرد شدید", "بدن درد", "آبریزش بینی"];
  }

  return suggestions.slice(0, 5);
}
