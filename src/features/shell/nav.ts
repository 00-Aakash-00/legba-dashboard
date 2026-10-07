import {
  KeyRoundIcon,
  LayoutGridIcon,
  type LucideIcon,
  MonitorUpIcon,
  PackageIcon,
  PencilLineIcon,
} from "lucide-react";
import type { Route } from "next";
import { nav } from "@/content/copy";

export type NavKey = keyof typeof nav.items;

export type NavItem = {
  key: NavKey;
  href: Route;
  /** The first URL segment this item owns (null = the overview at "/"). */
  segment: string | null;
  label: string;
  short: string;
  /** Glyph per docs/design/spec/icons.json. */
  icon: LucideIcon;
  /**
   * Inactive header ink, measured per label from the mockup
   * (spec overview.json header.nav.*.label; Overview is only drawn active).
   */
  ink: string;
};

export const NAV_ITEMS: NavItem[] = [
  {
    key: "overview",
    href: "/",
    segment: null,
    label: nav.items.overview,
    short: nav.short.overview,
    icon: LayoutGridIcon,
    ink: "#9a9ea4",
  },
  {
    key: "deployments",
    href: "/deployments",
    segment: "deployments",
    label: nav.items.deployments,
    short: nav.short.deployments,
    icon: MonitorUpIcon,
    ink: "#9a9ea4",
  },
  {
    key: "models",
    href: "/models",
    segment: "models",
    label: nav.items.models,
    short: nav.short.models,
    icon: PackageIcon,
    ink: "#9a9da1",
  },
  {
    key: "registries",
    href: "/registries",
    segment: "registries",
    label: nav.items.registries,
    short: nav.short.registries,
    icon: PencilLineIcon,
    ink: "#969ba0",
  },
  {
    key: "apiKeys",
    href: "/api-keys",
    segment: "api-keys",
    label: nav.items.apiKeys,
    short: nav.short.apiKeys,
    icon: KeyRoundIcon,
    ink: "#9ba5aa",
  },
];

/** Which nav item a layout segment belongs to (subscriptions live under Overview). */
export function activeNavKey(segment: string | null): NavKey | null {
  if (segment === null || segment === "subscriptions") return "overview";
  return NAV_ITEMS.find((item) => item.segment === segment)?.key ?? null;
}
