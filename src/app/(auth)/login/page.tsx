import type { Metadata } from "next";
import { auth } from "@/content/copy";
import { AuthScreen, AuthSwitch } from "@/features/auth/auth-screen";
import { LoginForm } from "@/features/auth/login-form";
import { ProviderSignIn } from "@/features/auth/provider-sign-in";

export const metadata: Metadata = { title: auth.login.title };

export default function LoginPage() {
  const { login } = auth;
  return (
    <AuthScreen
      heading={login.headingLines}
      subtitle={login.subtitle}
      legalLead={login.legalLead}
    >
      <LoginForm />
      <ProviderSignIn />
      <AuthSwitch
        prompt={login.noAccount}
        label={login.register}
        href="/register"
        className="mt-8 lg:mt-9"
      />
    </AuthScreen>
  );
}
