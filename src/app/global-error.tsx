"use client";

import "./globals.css";
import { RotateCcwIcon, TriangleAlertIcon } from "lucide-react";
import { JetBrains_Mono, Montserrat } from "next/font/google";
import {
  StandaloneFrame,
  StatusScreen,
} from "@/components/patterns/status-screen";
import { Button } from "@/components/ui/button";
import { errorPages } from "@/content/copy";

// global-error replaces the root layout, so it brings its own fonts and styles.
const sans = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const copy = errorPages.global;
  return (
    <html
      lang="en"
      className={`dark ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh">
        <title>{copy.title}</title>
        <StandaloneFrame>
          <StatusScreen
            icon={TriangleAlertIcon}
            eyebrow={copy.eyebrow}
            title={copy.heading}
            body={copy.body}
            reference={error.digest}
            actions={
              // A full reload rebuilds the root layout from scratch.
              <Button
                variant="pill-red"
                size="pill-lg"
                onClick={() => window.location.reload()}
                className="px-6 pointer-coarse:h-12"
              >
                <RotateCcwIcon aria-hidden className="size-[17px]" />
                {copy.action}
              </Button>
            }
          />
        </StandaloneFrame>
      </body>
    </html>
  );
}
