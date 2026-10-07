import "server-only";

import { requireUser } from "../session";

export type ProfileDTO = {
  name: string;
  email: string;
  initials: string;
  avatarUrl: string | null;
};

/** The account shown in the header. Never fails for a valid session. */
export async function getProfile(): Promise<ProfileDTO> {
  const user = await requireUser();
  const initials = user.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return {
    name: user.name,
    email: user.email,
    initials: initials || user.email[0]?.toUpperCase() || "?",
    avatarUrl: user.id === "usr_jane" ? "/images/avatars/default.webp" : null,
  };
}
