"use client";

import { catchError, type ErrorInfo } from "next/error";
import { AccountMenuView } from "./account-menu-view";

// camelCase on purpose: catchError calls this as a function, not a component.
function renderAccountFallback(_props: object, { retry }: ErrorInfo) {
  return <AccountMenuView profile={null} onRetry={retry} />;
}

/**
 * If the account slot fails, the header keeps a generic avatar whose menu
 * says so, retries just this slot, and can still sign out (ux-guidelines:
 * degrade one section, never the shell).
 */
export const AccountBoundary = catchError(renderAccountFallback);
