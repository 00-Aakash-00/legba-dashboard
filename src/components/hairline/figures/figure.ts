/**
 * The contract of this folder. Each figure is `<kind>.js` (with `<kind>.d.ts`):
 * a hairline-create figure as an ES module on the shared kernel (`../kernel.js`),
 * default-exporting `HairlineFigureModule`. `../hairline-figure.tsx` loads it
 * with `import(\`./figures/${kind}\`)`.
 *
 * This file is types only (it compiles to an empty module). It also keeps that
 * import pattern resolvable while no figure has been dropped in yet: Turbopack
 * rejects a dynamic import whose pattern matches no file, and with this module
 * present a missing figure is a catchable "Cannot find module" instead.
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
  /** One sentence saying what the figure shows: the interactive stage's accessible name. */
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
