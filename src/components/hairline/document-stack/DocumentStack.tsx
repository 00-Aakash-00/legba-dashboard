"use client"

import { type CSSProperties, useEffect, useId, useRef, useState } from "react"
import { DOCUMENT_STACK_DITHER, DOCUMENT_STACK_FALLBACK } from "./assets"
import styles from "./DocumentStack.module.css"

export type DocumentStackProps = {
  className?: string
  style?: CSSProperties
  label?: string
  interactive?: boolean
  loading?: "eager" | "lazy"
}

const DEFAULT_LABEL = "A stack of document cards parts to reveal a folded page and ruled text."

/** Copy this entire folder into any React project with CSS Modules support. */
export default function DocumentStack({
  className,
  style,
  label = DEFAULT_LABEL,
  interactive = true,
  loading = "eager",
}: DocumentStackProps) {
  const stageRef = useRef<HTMLDivElement>(null)
  const readRef = useRef<HTMLSpanElement>(null)
  const guidanceId = useId()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stage = stageRef.current
    const read = readRef.current
    if (!stage || !read) return

    let cancelled = false
    let started = false
    let destroy: (() => void) | undefined
    let svg: SVGSVGElement | undefined
    let observer: IntersectionObserver | undefined
    setReady(false)

    function mount() {
      if (cancelled || started) return
      started = true
      void import("./documents.js")
        .then(({ default: figure }) => {
          if (cancelled || !stage || !read) return
          svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
          svg.setAttribute("viewBox", "0 0 400 320")
          svg.setAttribute("aria-hidden", "true")
          stage.append(svg)
          destroy = figure.mount({ stage, svg, read }, figure.range[1]).destroy
          setReady(true)
        })
        .catch(() => {
          destroy?.()
          svg?.remove()
        })
    }

    if (interactive && loading === "lazy" && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return
          observer?.disconnect()
          mount()
        },
        { rootMargin: "200px" },
      )
      observer.observe(stage)
    } else if (interactive) {
      mount()
    }

    return () => {
      cancelled = true
      observer?.disconnect()
      destroy?.()
      svg?.remove()
      read.textContent = ""
    }
  }, [interactive, loading])

  const active = interactive && ready
  const artworkStyle = {
    "--document-stack-dither": `url("${DOCUMENT_STACK_DITHER}")`,
    ...style,
  } as CSSProperties

  return (
    <div
      className={[styles.artwork, className].filter(Boolean).join(" ")}
      style={artworkStyle}
      data-document-stack=""
      data-ready={active || undefined}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 400 400"
        preserveAspectRatio="none"
        className={styles.grid}
      >
        <g className={styles.gridLines}>
          <path d="M60 0V400M116 0V400M228 0V400M284 0V400M340 0V400M0 24H400M0 80H400M0 136H400M0 192H400M0 248H400M0 304H400M0 360H400" />
          <path d="M172 0V400" className={styles.gridSpine} />
        </g>
        <g className={styles.gridNodes}>
          <rect x="170.75" y="22.75" width="2.5" height="2.5" rx="0.4" />
          <rect x="171" y="79" width="2" height="2" rx="0.3" />
          <rect x="171" y="359" width="2" height="2" rx="0.3" />
        </g>
      </svg>
      {/* biome-ignore lint/performance/noImgElement: Embedded SVG requires no image service or framework-specific image component. */}
      <img
        src={DOCUMENT_STACK_FALLBACK}
        alt={active ? "" : label}
        width={400}
        height={320}
        loading={loading}
        className={styles.fallback}
      />
      {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: The mounted stage receives its group role and accessible name together. */}
      <div
        ref={stageRef}
        className={styles.stage}
        data-document-stack-stage=""
        role={active ? "group" : undefined}
        tabIndex={active ? 0 : undefined}
        aria-label={active ? label : undefined}
        aria-describedby={active ? guidanceId : undefined}
        aria-hidden={active ? undefined : true}
      />
      <span id={guidanceId} className={styles.srOnly} hidden={!active}>
        Arrow keys adjust the figure. Home and End set the minimum and maximum. Escape restores the resting view.
      </span>
      <span ref={readRef} className={styles.srOnly} aria-live="polite" aria-atomic="true" />
    </div>
  )
}
