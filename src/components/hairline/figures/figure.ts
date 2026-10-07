/**
 * The contract of this folder. Each figure is `<kind>.js` (with `<kind>.d.ts`):
 * a hairline-create figure as an ES module on the shared kernel (`../kernel.js`),
 * its figure code unchanged from the skill's file and default-exporting
 * `HairlineFigureModule` in place of the bench's `hairline({...})` call.
 * `../hairline-figure.tsx` imports each one by name (its `FIGURES`).
 *
 * This file is types only (it compiles to an empty module).
 */

export type FigureElements = {
  stage: HTMLElement;
  svg: SVGSVGElement;
  read: HTMLElement;
};

export type FigureHandle = {
  set: (value: number) => void;
  destroy: () => void;
};

export type HairlineFigureModule = {
  name: string;
  /** One sentence saying what the figure shows (the bench's caption; the host names its stage from copy). */
  means: string;
  rules: number[];
  /** The figure's one number at intensity 0, 0.5 and 1; the middle is the default. */
  range: [number, number, number];
  mount: (elements: FigureElements, value: number) => FigureHandle;
};

/** The part of the kernel's `HL` the host calls (the rest is the figures' business). */
export type HairlineKernel = {
  inject: (root: Document) => void;
  mk: (
    tag: "svg",
    attrs: Record<string, string>,
    parent: Element,
  ) => SVGSVGElement;
};
