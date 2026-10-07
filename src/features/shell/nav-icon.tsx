import type { NavItem } from "./nav";

/**
 * A nav glyph (icons.json). Only the Overview grid changes shape when active:
 * it is drawn filled, the other glyphs switch colour only. A narrow glyph
 * gives back its extra side bearing (`item.trim`), so every label sits the
 * mockup's ≈6.5px from its icon's ink.
 */
export function NavIcon({
  item,
  active,
  size,
}: {
  item: NavItem;
  active: boolean;
  /** Edge length in px. */
  size: number;
}) {
  const Icon = item.icon;
  const filled = active && item.key === "overview";
  return (
    <Icon
      size={size}
      strokeWidth={filled ? 1.75 : 2.25}
      fill={filled ? "currentColor" : "none"}
      style={item.trim ? { marginInline: (-item.trim * size) / 24 } : undefined}
      className="shrink-0"
    />
  );
}
