import { Dialog } from "@base-ui/react/dialog";
import { retryableImport } from "@/features/shell/retryable-import";

/**
 * One top-up dialog for the whole shell. The header button, the account menu
 * (phones) and the search palette all open the root mounted in the header.
 */
export const topUpDialog = Dialog.createHandle();

/** The form loads on first open; every entry point preloads it on intent. */
export const topUpForm = retryableImport(() => import("./top-up-form"));
