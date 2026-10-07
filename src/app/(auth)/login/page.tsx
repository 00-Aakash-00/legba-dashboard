import type { Metadata } from "next";
import { auth } from "@/content/copy";

export const metadata: Metadata = { title: auth.login.title };

export default function LoginPage() {
  return <main id="main">{auth.login.headingLines.join(" ")}</main>;
}
