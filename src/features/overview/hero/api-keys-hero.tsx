import { ChevronRightIcon, KeyIcon } from "lucide-react";
import Image from "next/image";
import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import { overview } from "@/content/copy";
import { CreateKeyDialog } from "@/features/api-keys/create-key-dialog";
import { cn } from "@/lib/utils";
import styles from "./api-keys-hero.module.css";

const TITLE_ID = "api-keys-hero-title";

/** Mockup line breaks hold on the desktop card; narrower cards rewrap. */
function Lines({ lines }: { lines: readonly string[] }) {
  return lines.map((line, index) => (
    <Fragment key={line}>
      {index > 0 ? (
        <>
          {" "}
          <br className="hidden @xl/hero:inline" />
        </>
      ) : null}
      {line}
    </Fragment>
  ));
}

/**
 * Overview hero (docs/design/spec/overview.json, hero.*). Static: it
 * prerenders into the shell, and its art is the page's LCP image. The light
 * streaks and particle dust live in the art; the content column sits 2px left
 * of centre, as drawn.
 */
export function ApiKeysHero() {
  const { hero } = overview;
  return (
    <section
      aria-labelledby={TITLE_ID}
      className="@container/hero relative isolate flex min-h-[300px] overflow-hidden rounded-[18px] border border-[#232325] bg-hero"
    >
      <Image
        src="/images/overview/api-keys-hero.webp"
        alt=""
        fill
        loading="eager"
        fetchPriority="high"
        sizes="(min-width: 1440px) 925px, (min-width: 1280px) 64vw, (min-width: 1024px) 60vw, calc(100vw - 32px)"
        className="pointer-events-none select-none object-cover object-center opacity-80 @xl/hero:object-top"
      />
      <div className="relative flex w-full flex-col items-center justify-center px-5 py-9 text-center @xl/hero:pt-[66.3px] @xl/hero:pr-1 @xl/hero:pb-[43.15px] @xl/hero:pl-0">
        {/* Small caps, built by hand: Montserrat has no smcp, so the initials
            are 12.5px capitals and the rest 11px capitals. */}
        <p className="flex items-center gap-[22.1px] font-medium text-[#8b9196] text-[11px] uppercase leading-[14px] tracking-[0.075em]">
          {hero.eyebrow.map((word, index) => (
            <Fragment key={word}>
              {index > 0 ? (
                <>
                  {" "}
                  <span
                    aria-hidden
                    className="size-[3.6px] shrink-0 rounded-full bg-[#7c8287] text-[0px] text-transparent"
                  >
                    •
                  </span>{" "}
                </>
              ) : null}
              <span className={styles.trim}>
                {/* letter-spacing in em computes per element: restate it at 12.5px. */}
                <span className="text-[12.5px] tracking-[0.075em]">
                  {word[0]}
                </span>
                {word.slice(1)}
              </span>
            </Fragment>
          ))}
        </p>
        <h2
          id={TITLE_ID}
          className={cn(
            styles.trimDescent,
            "mt-3.5 font-semibold text-[#fdfdfd] text-[30px] leading-[34px] tracking-[-0.015em] @xl/hero:mt-[27.6px] @xl/hero:text-[36px] @xl/hero:leading-[44px]",
          )}
        >
          {hero.title}
        </h2>
        <p
          className={cn(
            styles.trim,
            "mt-3 max-w-[23rem] text-balance font-medium text-[#a2a9b0] text-[15px] leading-[21px] tracking-[-0.03em] @xl/hero:mt-[14.66px] @xl/hero:max-w-none @xl/hero:text-[16px] @xl/hero:leading-[22px] @xl/hero:tracking-[-0.036em]",
          )}
        >
          <Lines lines={hero.body} />
        </p>
        <CreateKeyDialog
          trigger={
            <Button
              variant="pill-dark"
              size="pill-xl"
              className={cn(
                styles.cta,
                "mt-6 h-[52px] w-full max-w-[432.5px] justify-start gap-4 border-transparent bg-none pr-4 pl-5 shadow-none hover:border-transparent hover:shadow-none motion-safe:active:scale-[0.97] motion-reduce:active:opacity-85",
                "@xl/hero:mt-[21.7px] @xl/hero:h-[59.2px] @xl/hero:w-[432.5px] @xl/hero:gap-5 @xl/hero:pr-5 @xl/hero:pl-[28.5px]",
              )}
            >
              <KeyIcon
                strokeWidth={3.5}
                className="size-6 text-signal-key @xl/hero:size-[25px]"
              />
              <span className="text-[#e6e5e4] text-[16px] leading-4 tracking-[-0.03em] @xl/hero:text-[16.5px]">
                {hero.cta}
              </span>
              <ChevronRightIcon
                strokeWidth={2.25}
                className="ml-auto size-[22px] text-[#e74255]"
              />
            </Button>
          }
        />
        <p
          className={cn(
            styles.trimDescent,
            "mt-5 max-w-[20rem] text-balance font-medium text-[#7e8589] text-[13px] leading-[18.5px] tracking-[-0.028em] @xl/hero:mt-[26.9px] @xl/hero:max-w-none",
          )}
        >
          <Lines lines={hero.caption} />
        </p>
      </div>
    </section>
  );
}
