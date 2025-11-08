// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            سیستم نسخه‌پیچی پزشکی
          </h1>
          <p className="text-gray-600">برای دسترسی به سیستم لطفاً وارد شوید</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <SignIn
            appearance={{
              baseTheme: dark,
              variables: {
                colorPrimary: "#2563eb",
                colorText: "#1f2937",
                colorTextSecondary: "#6b7280",
                colorBackground: "#ffffff",
                colorInputBackground: "#f9fafb",
                colorInputText: "#1f2937",
              },
              elements: {
                rootBox: "mx-auto w-full",
                card: "shadow-none bg-transparent w-full",
                headerTitle: "text-xl font-bold text-gray-900 text-right",
                headerSubtitle: "text-gray-600 text-right",
                socialButtonsBlockButton:
                  "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
                socialButtonsBlockButtonText: "text-gray-700",
                formButtonPrimary:
                  "bg-blue-600 hover:bg-blue-700 text-white font-medium",
                formFieldLabel: "text-gray-700 font-medium text-right",
                formFieldInput:
                  "bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500",
                footerActionText: "text-gray-600 text-right",
                dividerLine: "bg-gray-300",
                dividerText: "text-gray-500 bg-white",
                identityPreviewEditButton: "text-blue-600 hover:text-blue-700",
                formResendCodeLink: "text-blue-600 hover:text-blue-700",
              },
            }}
            // Remove localization prop from here
            routing="path"
            path="/sign-in"
            fallbackRedirectUrl="/"
            signUpUrl="/sign-up"
          />
        </div>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>سیستم مدیریت نسخه‌های پزشکی - نسخه ۱.۰</p>
        </div>
      </div>
    </div>
  );
}
