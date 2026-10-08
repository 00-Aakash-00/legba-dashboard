import type { Metadata } from "next";
import Link from "next/link";
import {
  StandaloneFrame,
  StatusScreen,
} from "@/components/patterns/status-screen";
import { buttonVariants } from "@/components/ui/button";
import { errorPages } from "@/content/copy";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: errorPages.notFound.title };

/** Unknown URLs render here, inside the root layout only (no app shell). */
export default function NotFound() {
  const copy = errorPages.notFound;
  return (
    <StandaloneFrame>
      <StatusScreen
        figure="signpost"
        eyebrow={copy.eyebrow}
        title={copy.heading}
        body={copy.body}
        actions={
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "pill-red", size: "pill-lg" }),
              "px-6 pointer-coarse:h-12",
            )}
          >
            {copy.action}
          </Link>
        }
      />
    </StandaloneFrame>
  );
}
