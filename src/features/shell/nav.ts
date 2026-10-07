import {
  AppWindowIcon,
  BotIcon,
  KeyRoundIcon,
  LayoutGridIcon,
  type LucideIcon,
  PlugIcon,
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
    key: "sessions",
    href: "/sessions",
    segment: "sessions",
    label: nav.items.sessions,
    short: nav.short.sessions,
    icon: AppWindowIcon,
    ink: "#9a9ea4",
  },
  {
    key: "mcp",
    href: "/mcp",
    segment: "mcp",
    label: nav.items.mcp,
    short: nav.short.mcp,
    icon: PlugIcon,
    ink: "#9a9da1",
  },
  {
    key: "agentSkill",
    href: "/agent-skill",
    segment: "agent-skill",
    label: nav.items.agentSkill,
    short: nav.short.agentSkill,
    icon: BotIcon,
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
