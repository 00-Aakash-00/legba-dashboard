import { io } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import { HairlineFigure } from "@/components/hairline/hairline-figure";
import { RowsSkeleton } from "@/components/patterns/rows-skeleton";
import { SectionBoundary } from "@/components/patterns/section-boundary";
import { SectionCard } from "@/components/patterns/section-card";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";
import { workspace } from "@/content/copy";
import { cn } from "@/lib/utils";
import { listSessions } from "@/server/services/sessions";

/**
 * The sessions list, in StubSection's shape: its own fetch behind Suspense
 * (row skeletons after 300ms) and its own error boundary with a retry, then
 * a first-use empty state, or the list once sessions exist. No icon tile
 * (icons live in the nav bar), and no borrowed figure: every hairline figure
 * is unique (AGENTS.md), so these states wait for the Sessions figures. The
 * empty state sits at a fixed distance from the top, so it stays put when the
 * card is stretched by a taller neighbour.
 */
export function SessionsSection() {
  const copy = workspace.sessions;
  return (
    <SectionCard
      headingId="sessions-heading"
      title={copy.section}
      className="min-h-[360px]"
    >
      <SectionBoundary
        figure="flapboard"
        title={copy.error.title}
        body={copy.error.body}
        className="flex-1"
      >
        <Suspense fallback={<RowsSkeleton label={copy.loading} />}>
          <Sessions />
        </Suspense>
      </SectionBoundary>
    </SectionCard>
  );
}

/** Reads the demo state's cookie, so it renders only below the Suspense boundary. */
async function Sessions() {
  // The demo backend times its failure window with Date.now(), so this stays
  // out of prerendered output (io() resolves at once on a real request).
  await io();
  const sessions = await listSessions();
  if (sessions.length > 0) {
    return (
      <ul className="px-2 pt-4 pb-2">
        {sessions.map((session) => (
          <li
            key={session.id}
            className="flex h-16 items-center border-line-soft border-t px-3 font-semibold text-[14.5px] text-ink tracking-[-0.02em]"
          >
            {session.name}
          </li>
        ))}
      </ul>
    );
  }
  const copy = workspace.sessions;
  return (
    <Empty className="flex-1 justify-start gap-7 border-0 px-6 pt-14 pb-12">
      <EmptyHeader className="max-w-[440px] gap-0">
        <EmptyMedia className="mb-5">
          <HairlineFigure kind="blankwindows" decorative className="h-36" />
        </EmptyMedia>
        <h3 className="font-semibold text-[19px] text-ink leading-6 tracking-[-0.03em]">
          {copy.empty.title}
        </h3>
        <EmptyDescription className="mt-2 font-medium text-[15px] text-ink-2 leading-[21.5px] tracking-[-0.025em]">
          {copy.empty.body}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="w-auto max-w-none max-sm:w-full">
        {/* Primary on top on phones, on the right from 640px (StatusScreen's order). */}
        <div className="flex w-full flex-col-reverse gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/api-keys"
            className={cn(
              buttonVariants({ variant: "outline-pill", size: "pill-lg" }),
              "px-6 pointer-coarse:h-12",
            )}
          >
            {workspace.createKey}
          </Link>
          <a
            href={copy.apiPreview}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "pill-red", size: "pill-lg" }),
              "px-6 pointer-coarse:h-12",
            )}
          >
            {copy.empty.action}
            <span className="sr-only"> {workspace.newTab}</span>
          </a>
        </div>
      </EmptyContent>
    </Empty>
  );
}
