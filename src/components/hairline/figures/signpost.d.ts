type FigureElements = {
  stage: HTMLElement
  svg: SVGSVGElement
  read: HTMLElement
}

declare const signpost: {
  name: string
  means: string
  rules: number[]
  range: [number, number, number]
  mount: (
    elements: FigureElements,
    value: number,
  ) => {
    set: (value: number) => void
    destroy: () => void
  }
}

export default signpost
