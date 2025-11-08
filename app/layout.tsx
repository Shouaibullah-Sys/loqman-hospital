import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/components/providers";
import { faIR } from "@clerk/localizations";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "سیستم نسخه‌پیچی پزشکی",
  description: "سیستم هوشمند نسخه‌نویسی و مدیریت بیماران",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      localization={faIR}
      appearance={{
        variables: {
          colorPrimary: "#3b82f6",
          colorBackground: "#ffffff",
          colorInputBackground: "#f9fafb",
          colorText: "#1f2937",
        },
      }}
    >
      <Providers>
        <html lang="fa" dir="rtl">
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            {children}
          </body>
        </html>
      </Providers>
    </ClerkProvider>
  );
}
