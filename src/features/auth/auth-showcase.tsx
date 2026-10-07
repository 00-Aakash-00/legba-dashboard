import { auth } from "@/content/copy";

/** STUB (owned by the auth builder): the red showcase carousel panel. */
export function AuthShowcase() {
  const slide = auth.showcase.slides[0];
  return (
    <section
      aria-label={auth.showcase.label}
      className="rounded-[28px] border-2 border-showcase-line bg-instances-base p-8"
    >
      <p className="font-semibold text-2xl text-bone">
        {slide.lead}
        <span className="text-signal">{slide.accent}</span>
      </p>
    </section>
  );
}
