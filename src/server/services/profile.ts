import "server-only";

import { DEMO_ACCOUNT } from "../demo";

export type ProfileDTO = {
  name: string;
  email: string;
  initials: string;
  avatarUrl: string | null;
};

/**
 * The account shown in the header. There is no auth, so it is the
 * placeholder account from the mockup. Async so a real API can replace it.
 */
export async function getProfile(): Promise<ProfileDTO> {
  const initials = DEMO_ACCOUNT.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return {
    name: DEMO_ACCOUNT.name,
    email: DEMO_ACCOUNT.email,
    initials,
    avatarUrl: DEMO_ACCOUNT.avatarUrl,
  };
}
