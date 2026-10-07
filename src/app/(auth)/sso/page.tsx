import type { Metadata } from "next";
import { auth } from "@/content/copy";
import { AuthScreen, BackToLogin } from "@/features/auth/auth-screen";
import { SsoForm } from "@/features/auth/sso-form";

export const metadata: Metadata = { title: auth.sso.title };

export default function SsoPage() {
  const { sso, login } = auth;
  return (
    <AuthScreen
      heading={[sso.heading]}
      subtitle={sso.subtitle}
      legalLead={login.legalLead}
    >
      <SsoForm />
      <BackToLogin label={sso.back} />
    </AuthScreen>
  );
}
