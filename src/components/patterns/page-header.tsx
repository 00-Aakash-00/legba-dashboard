import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Page title (28/32 semibold), one-line description and the page's primary
 * action: right-aligned from 640px, full width below the description on phones.
 */
export function PageHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="font-semibold text-[28px] text-ink leading-8 tracking-[-0.03em]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-[640px] font-medium text-[15px] text-ink-2 leading-[21.5px] tracking-[-0.025em]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <div className="flex shrink-0 max-sm:*:w-full">{action}</div>
      ) : null}
    </header>
  );
}

/**
 * Page frame shared by the stub pages. Gutters match the overview grid
 * (10px left / 16px right at 1440), so cards keep their edges across tabs.
 */
export function PageLayout({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex w-full flex-col gap-6 px-4 pt-5 pb-6 lg:pt-6 xl:pt-[27px] xl:pr-4 xl:pb-[19px] xl:pl-2.5">
      <PageHeader title={title} description={description} action={action} />
      {children}
    </div>
  );
}
