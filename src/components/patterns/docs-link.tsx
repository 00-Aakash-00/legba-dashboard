import { ArrowUpRightIcon } from "lucide-react";
import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { links, overviewDocs } from "@/content/copy";
import { cn } from "@/lib/utils";

/** The overview's wine "Explore" pill, pointing at the product docs in a new tab. */
export function DocsLink({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={links.docs}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        buttonVariants({ variant: "wine", size: "pill-lg" }),
        "pointer-coarse:h-12",
        className,
      )}
    >
      {children}
      <ArrowUpRightIcon aria-hidden className="size-[18px]" />
      <span className="sr-only"> {overviewDocs.opensInNewTab}</span>
    </a>
  );
}
