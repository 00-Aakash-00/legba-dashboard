import { Dialog } from "@base-ui/react/dialog";
import { retryableImport } from "@/features/shell/retryable-import";

/** One palette for the whole shell: triggers anywhere open the root in the header. */
export const paletteDialog = Dialog.createHandle();

/** The cmdk body loads on first open; the triggers preload it on intent. */
export const paletteBody = retryableImport(() => import("./palette-body"));
