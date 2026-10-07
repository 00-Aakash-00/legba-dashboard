import type { LucideIcon } from "lucide-react";
import { type ReactNode, Suspense } from "react";
import { EmptyState } from "./empty-state";
import { RowsSkeleton } from "./rows-skeleton";
import { SectionBoundary } from "./section-boundary";
import { SectionCard } from "./section-card";

type Item = { id: string; name: string };

type StubCopy = {
  section: string;
  loading: string;
  empty: { title: string; body: string };
  error: { title: string; body: string };
};

/**
 * A designed stub section: its own fetch behind Suspense (delayed row
 * skeletons) and its own error boundary with retry, then a first-use empty
 * state with the section's main action, or the list once the backend has data.
 */
export function StubSection({
  id,
  copy,
  icon,
  action,
  load,
}: {
  id: string;
  copy: StubCopy;
  icon: LucideIcon;
  action: ReactNode;
  load: () => Promise<Item[]>;
}) {
  return (
    <SectionCard
      headingId={`${id}-heading`}
      title={copy.section}
      className="min-h-[420px] lg:min-h-[480px]"
    >
      <SectionBoundary
        title={copy.error.title}
        body={copy.error.body}
        className="flex-1"
      >
        <Suspense fallback={<RowsSkeleton label={copy.loading} />}>
          <StubItems load={load} copy={copy} icon={icon} action={action} />
        </Suspense>
      </SectionBoundary>
    </SectionCard>
  );
}

async function StubItems({
  load,
  copy,
  icon,
  action,
}: {
  load: () => Promise<Item[]>;
  copy: StubCopy;
  icon: LucideIcon;
  action: ReactNode;
}) {
  const items = await load();
  if (items.length === 0) {
    return (
      <EmptyState
        icon={icon}
        title={copy.empty.title}
        body={copy.empty.body}
        action={action}
        className="flex-1"
      />
    );
  }
  return (
    <ul className="px-2 pt-4 pb-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex h-16 items-center border-line-soft border-t px-3 font-semibold text-[14.5px] text-ink tracking-[-0.02em]"
        >
          {item.name}
        </li>
      ))}
    </ul>
  );
}
