import { ClerkAuthPage, ClerkSignUp } from "@/components/clerk-theme-provider";

export default function SignUpPage() {
  return (
    <ClerkAuthPage
      title="ایجاد حساب کاربری"
      subtitle="برای استفاده از سیستم حساب کاربری ایجاد کنید"
      footerText="حساب کاربری پزشک - سیستم نسخه‌پیچی"
    >
      <ClerkSignUp
        routing="path"
        path="/sign-up"
        fallbackRedirectUrl="/"
        signInUrl="/sign-in"
      />
    </ClerkAuthPage>
  );
}
