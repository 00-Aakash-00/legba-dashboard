import type { Metadata } from "next";
import { auth } from "@/content/copy";
import { AuthScreen, BackToLogin } from "@/features/auth/auth-screen";
import { ForgotForm } from "@/features/auth/forgot-form";

export const metadata: Metadata = { title: auth.forgot.title };

export default function ForgotPasswordPage() {
  const { forgot } = auth;
  return (
    <AuthScreen heading={[forgot.heading]} subtitle={forgot.subtitle}>
      <ForgotForm />
      <BackToLogin label={forgot.back} />
    </AuthScreen>
  );
}
