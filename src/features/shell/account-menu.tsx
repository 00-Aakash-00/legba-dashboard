import { getProfile } from "@/server/services/profile";
import { AccountMenuView } from "./account-menu-view";

/**
 * The header account slot. Reads the session, so the (app) layout renders it
 * below <Suspense> (AvatarSkeleton) inside AccountBoundary.
 */
export async function AccountMenu() {
  const profile = await getProfile();
  return <AccountMenuView profile={profile} />;
}
