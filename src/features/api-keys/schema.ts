import * as z from "zod";
import { apiKeys } from "@/content/copy";
import { KEY_NAME_MAX } from "./key-name";

/** createKey's input: the same trimmed 1–64 rule as keyNameError. */
export const KeyNameSchema = z
  .string({ error: apiKeys.dialog.nameRequired })
  .trim()
  .min(1, { error: apiKeys.dialog.nameRequired })
  .max(KEY_NAME_MAX, { error: apiKeys.dialog.nameTooLong });

/** revokeKey's input: an id shaped like the ones the store issues. */
export const KeyIdSchema = z.string().regex(/^key_[A-Za-z0-9]{1,64}$/);
