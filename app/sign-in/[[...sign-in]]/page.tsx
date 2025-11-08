import { ClerkAuthPage, ClerkSignIn } from "@/components/clerk-theme-provider";

export default function SignInPage() {
  return (
    <ClerkAuthPage
      title="سیستم نسخه‌پیچی پزشکی"
      subtitle="برای دسترسی به سیستم لطفاً وارد شوید"
      footerText="سیستم مدیریت نسخه‌های پزشکی - نسخه ۱.۰"
    >
      <ClerkSignIn
        routing="path"
        path="/sign-in"
        fallbackRedirectUrl="/"
        signUpUrl="/sign-up"
      />
    </ClerkAuthPage>
  );
}
