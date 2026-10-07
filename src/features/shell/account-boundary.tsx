"use client";

import { catchError } from "next/error";

/**
 * STUB (owned by the shell builder): if the account slot fails, fall back to
 * a generic avatar whose menu can still sign out (ux-guidelines degradation).
 */
function renderAccountFallback() {
  return (
    <form action="/auth/sign-out" method="post">
      <button
        type="submit"
        className="grid size-10 place-items-center rounded-full bg-chip text-sm"
      >
        ?
      </button>
    </form>
  );
}

export const AccountBoundary = catchError(renderAccountFallback);
