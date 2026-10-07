import { getProfile } from "@/server/services/profile";

/** STUB (owned by the shell builder): reads the session inside Suspense. */
export async function AccountMenu() {
  const profile = await getProfile();
  return (
    <span className="grid size-10 place-items-center rounded-full bg-chip font-semibold text-sm">
      {profile.initials}
    </span>
  );
}
