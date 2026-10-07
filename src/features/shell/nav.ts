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
};

export const NAV_ITEMS: NavItem[] = [
  {
    key: "overview",
    href: "/",
    segment: null,
    label: nav.items.overview,
    short: nav.short.overview,
  },
  {
    key: "deployments",
    href: "/deployments",
    segment: "deployments",
    label: nav.items.deployments,
    short: nav.short.deployments,
  },
  {
    key: "models",
    href: "/models",
    segment: "models",
    label: nav.items.models,
    short: nav.short.models,
  },
  {
    key: "registries",
    href: "/registries",
    segment: "registries",
    label: nav.items.registries,
    short: nav.short.registries,
  },
  {
    key: "apiKeys",
    href: "/api-keys",
    segment: "api-keys",
    label: nav.items.apiKeys,
    short: nav.short.apiKeys,
  },
];

/** Which nav item a layout segment belongs to (subscriptions live under Overview). */
export function activeNavKey(segment: string | null): NavKey | null {
  if (segment === null || segment === "subscriptions") return "overview";
  return NAV_ITEMS.find((item) => item.segment === segment)?.key ?? null;
}
