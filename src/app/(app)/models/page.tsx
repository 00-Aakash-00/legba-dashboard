import { PackageIcon } from "lucide-react";
import type { Metadata } from "next";
import { DocsLink } from "@/components/patterns/docs-link";
import { PageLayout } from "@/components/patterns/page-header";
import { StubSection } from "@/components/patterns/stub-section";
import { workspace } from "@/content/copy";
import { listModels } from "@/server/services/workspace";

export const metadata: Metadata = { title: workspace.models.title };

export default function ModelsPage() {
  const copy = workspace.models;
  return (
    <PageLayout title={copy.title} description={copy.description}>
      <StubSection
        id="models"
        copy={copy}
        icon={PackageIcon}
        load={listModels}
        action={<DocsLink>{copy.empty.action}</DocsLink>}
      />
    </PageLayout>
  );
}
