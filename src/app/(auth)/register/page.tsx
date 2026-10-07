import type { Metadata } from "next";
import { auth } from "@/content/copy";
import { AuthScreen, AuthSwitch } from "@/features/auth/auth-screen";
import { RegisterForm } from "@/features/auth/register-form";

export const metadata: Metadata = { title: auth.register.title };

export default function RegisterPage() {
  const { register } = auth;
  return (
    <AuthScreen
      heading={[register.heading]}
      subtitle={register.subtitle}
      legalLead={register.legalLead}
    >
      <RegisterForm />
      <AuthSwitch
        prompt={register.haveAccount}
        label={register.login}
        href="/login"
        className="mt-8 lg:mt-9"
      />
    </AuthScreen>
  );
}
