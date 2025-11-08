"use client";

import { useEffect, useState } from "react";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Check localStorage first, then system preference
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    if (stored) {
      setTheme(stored);
      return;
    }

    // Check system preference
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setTheme(systemPrefersDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    // Apply theme to html element
    const html = document.documentElement;
    if (theme === "dark") {
      html.setAttribute("data-theme", "dark");
      html.style.colorScheme = "dark";
    } else {
      html.setAttribute("data-theme", "light");
      html.style.colorScheme = "light";
    }
  }, [theme]);

  return { theme, setTheme };
}
