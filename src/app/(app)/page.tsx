import type { Metadata } from "next";
import { overview } from "@/content/copy";

export const metadata: Metadata = { title: overview.title };

export default function OverviewPage() {
  return <main id="main">{overview.hero.title}</main>;
}
