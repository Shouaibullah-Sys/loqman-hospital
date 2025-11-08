"use client";

import React, { useState, useEffect } from "react";
import { SignIn, SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import { ThemeToggle } from "./theme-toggle";

interface ClerkAuthPageProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  showThemeToggle?: boolean;
  footerText: string;
}

export function ClerkAuthPage({
  children,
  title,
  subtitle,
  showThemeToggle = true,
  footerText,
}: ClerkAuthPageProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-pulse text-center">
          <div className="w-8 h-8 bg-blue-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen bg-gradient-to-br transition-all duration-300 ${
        isDark ? "from-gray-900 to-gray-800" : "from-blue-50 to-indigo-100"
      } flex items-center justify-center p-4`}
    >
      <div className="w-full max-w-md">
        {showThemeToggle && (
          <div className="flex justify-end mb-4">
            <ThemeToggle />
          </div>
        )}

        <div className="text-center mb-8">
          <h1
            className={`text-3xl font-bold mb-2 transition-colors ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {title}
          </h1>
          <p
            className={`transition-colors ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {subtitle}
          </p>
        </div>

        <div
          className={`rounded-2xl shadow-lg p-8 border transition-all duration-300 ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          {children}
        </div>

        <div
          className={`text-center mt-6 text-sm transition-colors ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>{footerText}</p>
        </div>
      </div>
    </div>
  );
}

interface ClerkSignInProps {
  appearance?: any;
  [key: string]: any;
}

export function ClerkSignIn({ appearance, ...props }: ClerkSignInProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="animate-pulse">Loading...</div>;
  }

  const isDark = theme === "dark";

  return (
    <SignIn
      appearance={{
        baseTheme: isDark ? dark : undefined,
        variables: {
          colorPrimary: isDark ? "#3b82f6" : "#2563eb",
          colorText: isDark ? "#f9fafb" : "#1f2937",
          colorTextSecondary: isDark ? "#9ca3af" : "#6b7280",
          colorBackground: isDark ? "#1f2937" : "#ffffff",
          colorInputBackground: isDark ? "#374151" : "#f9fafb",
          colorInputText: isDark ? "#f9fafb" : "#1f2937",
          colorDanger: "#ef4444",
        },
        elements: {
          rootBox: "mx-auto w-full",
          card: "shadow-none bg-transparent w-full",
          headerTitle: `text-xl font-bold text-right ${
            isDark ? "text-white" : "text-gray-900"
          }`,
          headerSubtitle: `text-right ${
            isDark ? "text-gray-300" : "text-gray-600"
          }`,
          socialButtonsBlockButton: `border transition-colors ${
            isDark
              ? "bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          }`,
          socialButtonsBlockButtonText: isDark
            ? "text-gray-200"
            : "text-gray-700",
          formButtonPrimary: `font-medium transition-colors ${
            isDark
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`,
          formFieldLabel: `font-medium text-right ${
            isDark ? "text-gray-200" : "text-gray-700"
          }`,
          formFieldInput: `rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
            isDark
              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
              : "bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500"
          }`,
          footerActionText: `text-right ${
            isDark ? "text-gray-300" : "text-gray-600"
          }`,
          dividerLine: isDark ? "bg-gray-600" : "bg-gray-300",
          dividerText: isDark
            ? "text-gray-400 bg-gray-800"
            : "text-gray-500 bg-white",
          identityPreviewEditButton: isDark
            ? "text-blue-400 hover:text-blue-300"
            : "text-blue-600 hover:text-blue-700",
          formResendCodeLink: isDark
            ? "text-blue-400 hover:text-blue-300"
            : "text-blue-600 hover:text-blue-700",
        },
        ...appearance,
      }}
      {...props}
    />
  );
}

interface ClerkSignUpProps {
  appearance?: any;
  [key: string]: any;
}

export function ClerkSignUp({ appearance, ...props }: ClerkSignUpProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="animate-pulse">Loading...</div>;
  }

  const isDark = theme === "dark";

  return (
    <SignUp
      appearance={{
        baseTheme: isDark ? dark : undefined,
        variables: {
          colorPrimary: isDark ? "#3b82f6" : "#2563eb",
          colorText: isDark ? "#f9fafb" : "#1f2937",
          colorTextSecondary: isDark ? "#9ca3af" : "#6b7280",
          colorBackground: isDark ? "#1f2937" : "#ffffff",
          colorInputBackground: isDark ? "#374151" : "#f9fafb",
          colorInputText: isDark ? "#f9fafb" : "#1f2937",
          colorDanger: "#ef4444",
        },
        elements: {
          rootBox: "mx-auto w-full",
          card: "shadow-none bg-transparent w-full",
          headerTitle: `text-xl font-bold text-right ${
            isDark ? "text-white" : "text-gray-900"
          }`,
          headerSubtitle: `text-right ${
            isDark ? "text-gray-300" : "text-gray-600"
          }`,
          socialButtonsBlockButton: `border transition-colors ${
            isDark
              ? "bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          }`,
          socialButtonsBlockButtonText: isDark
            ? "text-gray-200"
            : "text-gray-700",
          formButtonPrimary: `font-medium transition-colors ${
            isDark
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`,
          formFieldLabel: `font-medium text-right ${
            isDark ? "text-gray-200" : "text-gray-700"
          }`,
          formFieldInput: `rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
            isDark
              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
              : "bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500"
          }`,
          footerActionText: `text-right ${
            isDark ? "text-gray-300" : "text-gray-600"
          }`,
          dividerLine: isDark ? "bg-gray-600" : "bg-gray-300",
          dividerText: isDark
            ? "text-gray-400 bg-gray-800"
            : "text-gray-500 bg-white",
        },
        ...appearance,
      }}
      {...props}
    />
  );
}
