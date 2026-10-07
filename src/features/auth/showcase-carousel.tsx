"use client";

import {
  type FocusEvent,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useSyncExternalStore,
  type WheelEvent,
} from "react";
import { auth } from "@/content/copy";
import { cn } from "@/lib/utils";

const { showcase: copy } = auth;
const SLIDES = copy.slides;
const AUTOPLAY_MS = 6000;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const reducedMotionNow = () => window.matchMedia(REDUCED_MOTION).matches;
// The server can't know: assume reduced, so nothing autoplays before hydration.
const reducedMotionOnServer = () => true;

/** Below 1024px the slides sit in a native scroll-snap row (the banner). */
function isScroller(track: HTMLElement) {
  return track.scrollWidth > track.clientWidth + 1;
}

/**
 * The showcase panel (desktop) / banner (< 1024px) with its slide carousel.
 *
 * Desktop crossfades the slides (400ms); the banner swipes with native
 * scroll-snap. Autoplay advances every 6s, pauses while the panel is hovered
 * or focused or the tab is hidden, stops for good after the user picks a
 * slide or swipes, and never runs under reduced motion. Activity hiding the
 * route cleans the timer up with the effects.
 */
export function ShowcaseCarousel({
  decor,
  mark,
}: {
  decor: ReactNode;
  mark: ReactNode;
}) {
  const [active, setActive] = useState(0);
  const [stopped, setStopped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    reducedMotionNow,
    reducedMotionOnServer,
  );
  const trackRef = useRef<HTMLDivElement>(null);

  const rotating = !reducedMotion && !stopped;
  const playing = rotating && !hovered && !focused && !pageHidden;

  function show(index: number) {
    const track = trackRef.current;
    if (track && isScroller(track)) {
      // The scroll listener below moves `active` as the row settles.
      track.scrollTo({
        left: index * track.clientWidth,
        behavior: reducedMotion ? "instant" : "smooth",
      });
    } else {
      setActive(index);
    }
  }

  const advanceTo = useEffectEvent((index: number) => show(index));

  useEffect(() => {
    if (!playing) return;
    const next = (active + 1) % SLIDES.length;
    const timer = window.setTimeout(() => advanceTo(next), AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [playing, active]);

  useEffect(() => {
    const sync = () => setPageHidden(document.hidden);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      if (!isScroller(track)) return;
      const index = Math.round(track.scrollLeft / track.clientWidth);
      setActive(Math.min(SLIDES.length - 1, Math.max(0, index)));
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  function pick(index: number) {
    setStopped(true);
    show(index);
  }

  // A touch or a sideways trackpad swipe on the banner is the user taking
  // over. On desktop the row doesn't scroll, so a click on the text or a
  // page scroll over it isn't carousel interaction.
  function onTrackPointerDown() {
    const track = trackRef.current;
    if (track && isScroller(track)) setStopped(true);
  }

  function onTrackWheel(event: WheelEvent<HTMLDivElement>) {
    const sideways = Math.abs(event.deltaX) > Math.abs(event.deltaY);
    if (sideways && isScroller(event.currentTarget)) setStopped(true);
  }

  function onPointerEnter(event: PointerEvent) {
    if (event.pointerType === "mouse") setHovered(true);
  }

  function onBlur(event: FocusEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  }

  return (
    <aside
      aria-label={copy.label}
      onPointerEnter={onPointerEnter}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={onBlur}
      className={cn(
        // Banner (< 1024): compact, above the form. Clipped, not hidden: a
        // hidden box is still a scroll container, so focus, scrollIntoView or
        // a #:~:text= link could scroll the overflowing art out of place.
        "relative isolate order-first mx-4 mt-[max(0.75rem,env(safe-area-inset-top,0px))] h-40 shrink-0 overflow-clip rounded-[24px] border-2 border-transparent shadow-[0_0_28px_-10px_rgb(233_25_59/0.55)]",
        // Gradient border: base fill in the padding box, the measured red
        // ramp (left → right) in the border box.
        "[background:linear-gradient(#040202,#040202)_padding-box,linear-gradient(90deg,#ea1a3c_0%,#c51a32_28%,#b0192c_52%,#8f1420_76%,#74101a_95%,#650e16_100%)_border-box]",
        // Panel (≥ 1024): full height, left column.
        "lg:col-start-1 lg:row-start-1 lg:m-0 lg:flex lg:h-auto lg:flex-col lg:rounded-[26px] lg:border-[7px] lg:shadow-none",
      )}
    >
      {decor}
      <div className="absolute inset-0 z-10 lg:relative lg:inset-auto lg:flex lg:flex-1 lg:flex-col lg:items-center lg:justify-end lg:pr-8 lg:pb-[31.5px] lg:pl-[35px]">
        <div className="pointer-events-none absolute top-4 left-4 z-10 lg:static lg:mb-[29.5px]">
          {mark}
        </div>

        <div
          ref={trackRef}
          aria-live={rotating ? "off" : "polite"}
          onPointerDown={onTrackPointerDown}
          onWheel={onTrackWheel}
          className="flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] lg:grid lg:h-auto lg:w-full lg:snap-none lg:overflow-visible [&::-webkit-scrollbar]:hidden"
        >
          {SLIDES.map((slide, index) => {
            const current = index === active;
            return (
              // biome-ignore lint/a11y/useSemanticElements: APG carousel pattern: each slide is role="group" + aria-roledescription="slide"; a fieldset would announce a form group.
              <div
                key={slide.accent}
                role="group"
                aria-roledescription={copy.slideRoleDescription}
                aria-label={copy.slide(index + 1, SLIDES.length)}
                inert={!current}
                className={cn(
                  "flex w-full shrink-0 snap-start snap-always flex-col justify-end pt-[68px] pr-[84px] pb-4 pl-4",
                  "lg:col-start-1 lg:row-start-1 lg:items-center lg:justify-start lg:p-0 lg:text-center lg:transition-opacity lg:duration-[400ms] lg:ease-in-out",
                  !current && "lg:opacity-0",
                )}
              >
                <h2 className="text-balance font-semibold text-[20px] text-white leading-6 tracking-[-0.03em] max-[359px]:text-[18px] max-[359px]:leading-[22px] lg:text-[27.5px] lg:leading-[33px] lg:tracking-[-0.055em]">
                  {slide.lead}
                  {/* Wraps as a unit: a long heading breaks between the white
                      lead and the red accent, never inside the accent. */}
                  <span className="inline-block text-auth-accent">
                    {slide.accent}
                  </span>
                </h2>
                {/* The clamp's lines are clipped, not hidden, for the same
                    reason as the panel: nothing can scroll them into view. */}
                <p className="mt-1 hidden text-sm text-white/80 leading-[18px] sm:line-clamp-2 sm:overflow-clip lg:mt-[14.95px] lg:line-clamp-none lg:block lg:max-w-[400px] lg:text-[15.5px] lg:text-white lg:leading-[20.5px]">
                  {slide.body}
                </p>
              </div>
            );
          })}
        </div>

        <fieldset
          aria-label={copy.dots}
          className="absolute right-2.5 bottom-1.5 z-20 m-0 flex min-w-0 border-0 p-0 lg:static lg:mt-[34.5px]"
        >
          {SLIDES.map((slide, index) => (
            <button
              key={slide.accent}
              type="button"
              aria-label={copy.goTo(index + 1, SLIDES.length)}
              aria-current={index === active ? "true" : undefined}
              onClick={() => pick(index)}
              className="group/dot grid h-9 w-6 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-signal lg:h-6 lg:w-5"
            >
              <span
                aria-hidden
                className="relative size-2.5 scale-[0.85] rounded-full bg-auth-dot-off transition-transform duration-200 ease-out-strong motion-reduce:transition-none before:absolute before:inset-0 before:rounded-full before:bg-auth-dot before:opacity-0 before:transition-opacity before:duration-200 group-hover/dot:bg-[#5a4848] group-active/dot:scale-75 group-aria-[current=true]/dot:scale-100 group-aria-[current=true]/dot:before:opacity-100"
              />
            </button>
          ))}
        </fieldset>
      </div>
    </aside>
  );
}
