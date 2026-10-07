import type { Metadata } from "next";
import { auth } from "@/content/copy";

export const metadata: Metadata = { title: auth.forgot.title };

/** STUB: replaced by the auth builder. */
export default function Page() {
  return (
    <h1 className="font-semibold text-2xl text-bone">{auth.forgot.heading}</h1>
  );
}
