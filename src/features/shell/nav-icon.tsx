import type { NavItem } from "./nav";

/**
 * A nav glyph (icons.json). Only the Overview grid changes shape when active:
 * it is drawn filled, the other glyphs switch colour only.
 */
export function NavIcon({
  item,
  active,
  className,
}: {
  item: NavItem;
  active: boolean;
  className?: string;
}) {
  const Icon = item.icon;
  const filled = active && item.key === "overview";
  return (
    <Icon
      strokeWidth={filled ? 1.75 : 2.25}
      fill={filled ? "currentColor" : "none"}
      className={className}
    />
  );
}
