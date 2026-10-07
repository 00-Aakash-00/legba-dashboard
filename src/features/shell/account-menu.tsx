import { getProfile } from "@/server/services/profile";
import { AccountMenuView } from "./account-menu-view";

/**
 * The header account slot: the placeholder account (there is no auth). The
 * (app) layout renders it below <Suspense> (AvatarSkeleton) inside
 * AccountBoundary, so a real profile API can replace it without layout work.
 */
export async function AccountMenu() {
  const profile = await getProfile();
  return <AccountMenuView profile={profile} />;
}
