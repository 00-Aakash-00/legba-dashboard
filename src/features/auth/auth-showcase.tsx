import { ShowcaseCarousel } from "./showcase-carousel";
import { ShowcaseDecor, ShowcaseMark } from "./showcase-decor";

/**
 * The red showcase: the left panel on desktop, a compact banner above the
 * form below 1024px. The art renders on the server; only the carousel (slide
 * state, dots, autoplay, swipe sync) ships as a client island.
 */
export function AuthShowcase() {
  return <ShowcaseCarousel decor={<ShowcaseDecor />} mark={<ShowcaseMark />} />;
}
