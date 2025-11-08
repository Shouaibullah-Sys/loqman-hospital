// app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ایجاد حساب کاربری
          </h1>
          <p className="text-gray-600">
            برای استفاده از سیستم حساب کاربری ایجاد کنید
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <SignUp
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
              },
            }}
            // Remove localization prop from here
            routing="path"
            path="/sign-up"
            fallbackRedirectUrl="/"
            signInUrl="/sign-in"
          />
        </div>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>حساب کاربری پزشک - سیستم نسخه‌پیچی</p>
        </div>
      </div>
    </div>
  );
}
