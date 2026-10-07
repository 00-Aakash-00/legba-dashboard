import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Montserrat } from "next/font/google";
import Script from "next/script";
import { meta } from "@/content/copy";
import "./globals.css";

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

export const metadata: Metadata = {
  title: { template: meta.titleTemplate, default: meta.defaultTitle },
  description: meta.description,
  applicationName: "Legba",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  colorScheme: "dark",
  themeColor: "#0a0a0b",
};

// React Scan is a dev-only render profiler: `pnpm dev:scan` turns it on.
const reactScan =
  process.env.NODE_ENV === "development" && process.env.REACT_SCAN === "1";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <head>
        {reactScan ? (
          <Script
            src="https://unpkg.com/react-scan@0.5.7/dist/auto.global.js"
            integrity="sha384-DDZCsimcjpG92OUulxf7DHi4rGS/fNIW7lC5DT8+5ftaTDiUKfzIq+pDTUbPjC86"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        ) : null}
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
