import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLayout } from "@/components/patterns/page-header";
import { SectionBoundary } from "@/components/patterns/section-boundary";
import { SectionCard } from "@/components/patterns/section-card";
import { Button } from "@/components/ui/button";
import { apiKeys } from "@/content/copy";
import { ApiKeysSkeleton } from "@/features/api-keys/api-keys-list";
import { ApiKeysSection } from "@/features/api-keys/api-keys-section";
import { CreateKeyDialog } from "@/features/api-keys/create-key-dialog";

export const metadata: Metadata = { title: apiKeys.pageTitle };

const HEADING_ID = "api-keys-heading";

export default function ApiKeysPage() {
  return (
    <PageLayout
      title={apiKeys.pageTitle}
      description={apiKeys.pageDescription}
      action={
        <CreateKeyDialog
          trigger={
            <Button
              variant="pill-dark"
              size="pill-lg"
              className="pointer-coarse:h-12"
            >
              {apiKeys.create}
            </Button>
          }
        />
      }
    >
      <SectionCard headingId={HEADING_ID} title={apiKeys.section}>
        <SectionBoundary
          title={apiKeys.error.title}
          body={apiKeys.error.body}
          className="flex-1"
        >
          <Suspense fallback={<ApiKeysSkeleton />}>
            <ApiKeysSection headingId={HEADING_ID} />
          </Suspense>
        </SectionBoundary>
      </SectionCard>
    </PageLayout>
  );
}
