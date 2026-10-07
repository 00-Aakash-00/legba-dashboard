import type { Metadata } from "next";
import { apiKeys } from "@/content/copy";

export const metadata: Metadata = { title: apiKeys.pageTitle };

/** STUB: replaced by its feature builder. */
export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-3.5 pt-7">
      <h1 className="font-semibold text-2xl text-bone">{apiKeys.pageTitle}</h1>
    </div>
  );
}
