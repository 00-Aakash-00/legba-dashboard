import { PencilLineIcon } from "lucide-react";
import type { Metadata } from "next";
import { DocsLink } from "@/components/patterns/docs-link";
import { PageLayout } from "@/components/patterns/page-header";
import { StubSection } from "@/components/patterns/stub-section";
import { workspace } from "@/content/copy";
import { listRegistries } from "@/server/services/workspace";

export const metadata: Metadata = { title: workspace.registries.title };

export default function RegistriesPage() {
  const copy = workspace.registries;
  return (
    <PageLayout title={copy.title} description={copy.description}>
      <StubSection
        id="registries"
        copy={copy}
        icon={PencilLineIcon}
        load={listRegistries}
        action={<DocsLink>{copy.empty.action}</DocsLink>}
      />
    </PageLayout>
  );
}
