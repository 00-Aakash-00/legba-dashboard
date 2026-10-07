import type { Metadata } from "next";
import { PageLayout } from "@/components/patterns/page-header";
import { workspace } from "@/content/copy";

export const metadata: Metadata = { title: workspace.agentSkill.title };

/** PLACEHOLDER: designed by the developer-pages builder in the pivot. */
export default function AgentSkillPage() {
  return (
    <PageLayout
      title={workspace.agentSkill.title}
      description={workspace.agentSkill.description}
    >
      {null}
    </PageLayout>
  );
}
