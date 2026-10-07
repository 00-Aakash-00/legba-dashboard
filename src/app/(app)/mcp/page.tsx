import type { Metadata } from "next";
import { PageLayout } from "@/components/patterns/page-header";
import { workspace } from "@/content/copy";

export const metadata: Metadata = { title: workspace.mcp.title };

/** PLACEHOLDER: designed by the developer-pages builder in the pivot. */
export default function McpPage() {
  return (
    <PageLayout
      title={workspace.mcp.title}
      description={workspace.mcp.description}
    >
      {null}
    </PageLayout>
  );
}
