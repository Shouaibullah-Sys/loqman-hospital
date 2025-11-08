"use client";

import { useEffect } from "react";

export function ThemeInitializer() {
  useEffect(() => {
    // This runs on the client after hydration
    // It will synchronize the theme attributes to match what was determined by useTheme
    const html = document.documentElement;

    // Get current theme from localStorage or system preference
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    if (stored) {
      if (stored === "dark") {
        html.setAttribute("data-theme", "dark");
        html.style.colorScheme = "dark";
      } else {
        html.setAttribute("data-theme", "light");
        html.style.colorScheme = "light";
      }
      return;
    }

    // Check system preference
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    if (systemPrefersDark) {
      html.setAttribute("data-theme", "dark");
      html.style.colorScheme = "dark";
    } else {
      html.setAttribute("data-theme", "light");
      html.style.colorScheme = "light";
    }
  }, []);

  return null;
}
