"use client";

import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";
import { unstable_rethrow, useRouter } from "next/navigation";
import {
  Fragment,
  startTransition as startRefresh,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/patterns/empty-state";
import { Bar, LoadingRegion } from "@/components/patterns/rows-skeleton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { apiKeys } from "@/content/copy";
import { cn } from "@/lib/utils";
import { revokeKey } from "./actions";
import {
  CreateKeyRoot,
  CreateKeyTrigger,
  useCreateKeyHandle,
} from "./create-key-dialog";
import {
  fromKeyboard,
  sheetBackdrop,
  sheetButton,
  sheetDescription,
  sheetFooter,
  sheetPopup,
  sheetTitle,
} from "./sheet";

export type ApiKeyItem = {
  id: string;
  name: string;
  /** Display prefix, e.g. "lgba_8fK2a1". The full key is never stored. */
  prefix: string;
  createdAt: string;
  /** createdAt, formatted on the server. */
  created: string;
  lastUsedAt: string | null;
  lastUsed: string | null;
};

type RevokeHandle = AlertDialogPrimitive.Handle<ApiKeyItem>;

/*
 * One table on every width. Below 768px only the name and the action show;
 * the key, dates and usage fold into a second line under the name. From
 * 768px the columns are fixed so the skeleton lines up with the rows.
 */
const COL = {
  name: "py-4 pr-3 pl-3 align-middle max-md:w-full max-md:max-w-0",
  key: "px-3 py-4 align-middle max-md:hidden md:w-[24%]",
  created: "px-3 py-4 align-middle max-md:hidden md:w-[18%]",
  lastUsed: "px-3 py-4 align-middle max-lg:hidden lg:w-[14%]",
  action: "py-4 pr-3 pl-2 text-right align-middle max-md:w-px md:w-[120px]",
};
const HEAD =
  "h-10 py-0 font-semibold text-[12px] text-ink-subtle uppercase tracking-[0.04em]";
const TABLE = "w-full border-collapse text-left md:table-fixed";

export function ApiKeysList({
  keys,
  headingId,
}: {
  keys: ApiKeyItem[];
  headingId: string;
}) {
  const [visible, removeOptimistic] = useOptimistic(
    keys,
    (current: ApiKeyItem[], id: string) =>
      current.filter((key) => key.id !== id),
  );
  const [failed, setFailed] = useState<string[]>([]);
  const [revoking, setRevoking] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const [revokeHandle] = useState(() =>
    AlertDialogPrimitive.createHandle<ApiKeyItem>(),
  );
  const createHandle = useCreateKeyHandle();
  const focusHeading = () => document.getElementById(headingId);
  // Names aren't unique; where two keys share one, labels need the prefix.
  const seen = new Set<string>();
  const sharedNames = new Set<string>();
  for (const key of visible) {
    if (seen.has(key.name)) sharedNames.add(key.name);
    seen.add(key.name);
  }

  function revoke(key: ApiKeyItem) {
    setFailed((ids) => ids.filter((id) => id !== key.id));
    setRevoking(key.name);
    revokeHandle.close();
    startTransition(async () => {
      // The row leaves now; if the server says no, useOptimistic puts it back.
      removeOptimistic(key.id);
      let ok = false;
      try {
        ok = (await revokeKey(key.id)).ok;
      } catch (error) {
        unstable_rethrow(error);
      }
      if (ok) {
        // Refresh in the same transition, so the optimistic removal holds
        // until the refreshed list (without the key) replaces it.
        startRefresh(() => router.refresh());
        toast.success(apiKeys.revoke.done(key.name));
      } else {
        // Shown on the restored row, next to the button that failed.
        setFailed((ids) => [...ids, key.id]);
      }
    });
  }

  return (
    <>
      {/* Persistent live region; its text fades in only if revoking takes >200ms. */}
      <p
        role="status"
        className="absolute top-5 right-5 max-w-[calc(100%-11rem)] font-medium text-[13px] text-ink-2"
      >
        {pending ? (
          <span className="pending-delay flex items-center gap-2">
            <Spinner size={18} tone="accent" />
            <span className="truncate">{apiKeys.revoke.pending(revoking)}</span>
          </span>
        ) : null}
      </p>

      {visible.length === 0 ? (
        <EmptyState
          title={apiKeys.empty.title}
          body={apiKeys.empty.body}
          className="flex-1"
          action={
            <CreateKeyTrigger
              handle={createHandle}
              trigger={
                <Button
                  variant="pill-red"
                  size="pill-lg"
                  className="pointer-coarse:h-12"
                >
                  {apiKeys.create}
                </Button>
              }
            />
          }
        />
      ) : (
        <>
          <div className="px-2 pt-3">
            <table className={TABLE}>
              <thead className="max-md:sr-only">
                <tr>
                  <th scope="col" className={cn(COL.name, HEAD)}>
                    {apiKeys.columns.name}
                  </th>
                  <th scope="col" className={cn(COL.key, HEAD)}>
                    {apiKeys.columns.key}
                  </th>
                  <th scope="col" className={cn(COL.created, HEAD)}>
                    {apiKeys.columns.created}
                  </th>
                  <th scope="col" className={cn(COL.lastUsed, HEAD)}>
                    {apiKeys.columns.lastUsed}
                  </th>
                  <th scope="col" className={cn(COL.action, HEAD)}>
                    <span className="sr-only">{apiKeys.columns.actions}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((key) => (
                  <Fragment key={key.id}>
                    <tr className="border-line-soft border-t">
                      <th scope="row" className={cn(COL.name, "font-normal")}>
                        <span className="block truncate font-semibold text-[14.5px] text-ink tracking-[-0.02em]">
                          {key.name}
                        </span>
                        <span className="mt-1 block font-medium font-mono text-[12.5px] text-ink-2 leading-5 md:hidden">
                          {key.prefix}…
                        </span>
                        <span className="block font-medium text-[12.5px] text-ink-subtle leading-5 md:hidden">
                          <span className="whitespace-nowrap">
                            {apiKeys.usage.created(key.created)}
                          </span>
                          <span aria-hidden> · </span>
                          <span className="whitespace-nowrap">
                            {key.lastUsed
                              ? apiKeys.usage.lastUsed(key.lastUsed)
                              : apiKeys.usage.never}
                          </span>
                        </span>
                      </th>
                      <td className={COL.key}>
                        <code className="rounded-[7px] border border-line-chip bg-field px-2 py-1 font-mono font-medium text-[12.5px] text-ink-2">
                          {key.prefix}…
                        </code>
                      </td>
                      <td
                        className={cn(
                          COL.created,
                          "font-medium text-[14px] text-ink-2",
                        )}
                      >
                        <time dateTime={key.createdAt}>{key.created}</time>
                      </td>
                      <td
                        className={cn(
                          COL.lastUsed,
                          "font-medium text-[14px] text-ink-subtle",
                        )}
                      >
                        {key.lastUsed && key.lastUsedAt ? (
                          <time dateTime={key.lastUsedAt}>{key.lastUsed}</time>
                        ) : (
                          apiKeys.neverUsed
                        )}
                      </td>
                      <td className={COL.action}>
                        <AlertDialogPrimitive.Trigger
                          handle={revokeHandle}
                          payload={key}
                          render={
                            <Button
                              variant="outline-pill"
                              size="pill-md"
                              aria-label={
                                sharedNames.has(key.name)
                                  ? apiKeys.revoke.actionWithKey(
                                      key.name,
                                      key.prefix,
                                    )
                                  : apiKeys.revoke.action(key.name)
                              }
                              className="h-9 px-4 text-[13px] hover:border-signal/60 hover:text-signal pointer-coarse:h-11"
                            />
                          }
                        >
                          {apiKeys.revoke.label}
                        </AlertDialogPrimitive.Trigger>
                      </td>
                    </tr>
                    {failed.includes(key.id) ? (
                      <tr>
                        <td colSpan={5} className="px-3 pb-4">
                          <p
                            role="alert"
                            className="font-medium text-[13.5px] text-signal leading-5"
                          >
                            {apiKeys.revoke.failed}
                          </p>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-auto border-line-soft border-t px-5 py-4 font-medium text-[13px] text-ink-subtle leading-5">
            {apiKeys.note}
          </p>
        </>
      )}

      <CreateKeyRoot handle={createHandle} fallbackFocus={focusHeading} />
      <RevokeDialog
        handle={revokeHandle}
        onConfirm={revoke}
        fallbackFocus={focusHeading}
      />
    </>
  );
}

function RevokeDialog({
  handle,
  onConfirm,
  fallbackFocus,
}: {
  handle: RevokeHandle;
  onConfirm: (key: ApiKeyItem) => void;
  fallbackFocus: () => HTMLElement | null;
}) {
  const [keyboard, setKeyboard] = useState(false);
  const trigger = useRef<Element | null>(null);
  return (
    <AlertDialogPrimitive.Root
      handle={handle}
      onOpenChange={(open, details) => {
        if (open) trigger.current = details.trigger ?? null;
        setKeyboard(fromKeyboard(details.event));
      }}
    >
      {({ payload: key }) => (
        <AlertDialogPrimitive.Portal>
          <AlertDialogPrimitive.Backdrop
            data-kbd={keyboard || undefined}
            className={sheetBackdrop}
          />
          <AlertDialogPrimitive.Popup
            data-kbd={keyboard || undefined}
            className={sheetPopup}
            // The revoked row (and its button) is gone by the time this closes.
            finalFocus={() =>
              trigger.current?.isConnected ? true : (fallbackFocus() ?? true)
            }
          >
            {key ? (
              <>
                <AlertDialogPrimitive.Title className={sheetTitle}>
                  {apiKeys.revoke.title(key.name)}
                </AlertDialogPrimitive.Title>
                <AlertDialogPrimitive.Description className={sheetDescription}>
                  {apiKeys.revoke.body}
                </AlertDialogPrimitive.Description>
                <dl className="mt-5 flex items-center justify-between gap-3 rounded-[12px] border border-auth-field-line bg-field px-3.5 py-3">
                  <dt className="font-semibold text-[12.5px] text-ink-subtle">
                    {apiKeys.revoke.keyLabel}
                  </dt>
                  <dd className="font-mono font-medium text-[13px] text-ink-2">
                    {key.prefix}…
                  </dd>
                </dl>
                <div className={sheetFooter}>
                  <AlertDialogPrimitive.Close
                    render={
                      <Button
                        variant="outline-pill"
                        size="pill-md"
                        className={sheetButton}
                      />
                    }
                  >
                    {apiKeys.revoke.cancel}
                  </AlertDialogPrimitive.Close>
                  <Button
                    variant="pill-red"
                    size="pill-md"
                    className={cn(sheetButton, "px-6")}
                    onClick={() => onConfirm(key)}
                  >
                    {apiKeys.revoke.confirm}
                  </Button>
                </div>
              </>
            ) : null}
          </AlertDialogPrimitive.Popup>
        </AlertDialogPrimitive.Portal>
      )}
    </AlertDialogPrimitive.Root>
  );
}

/** Mirrors the table (same columns and row height), behind a delayed fade. */
export function ApiKeysSkeleton() {
  return (
    <LoadingRegion label={apiKeys.loading} className="px-2 pt-3">
      <table className={TABLE}>
        <thead className="max-md:hidden">
          <tr>
            <th className={cn(COL.name, HEAD)}>
              <Bar className="h-2.5 w-11 bg-[#17191a]" />
            </th>
            <th className={cn(COL.key, HEAD)}>
              <Bar className="h-2.5 w-8 bg-[#17191a]" />
            </th>
            <th className={cn(COL.created, HEAD)}>
              <Bar className="h-2.5 w-14 bg-[#17191a]" />
            </th>
            <th className={cn(COL.lastUsed, HEAD)}>
              <Bar className="h-2.5 w-16 bg-[#17191a]" />
            </th>
            <th className={cn(COL.action, HEAD)} />
          </tr>
        </thead>
        <tbody>
          {["w-40", "w-28", "w-48"].map((width) => (
            <tr key={width} className="border-line-soft border-t">
              <td className={COL.name}>
                <div className="flex flex-col gap-2 py-1">
                  <Bar className={cn("max-w-full", width)} />
                  <Bar className="h-2.5 w-52 max-w-full bg-[#17191a] md:hidden" />
                </div>
              </td>
              <td className={COL.key}>
                <Skeleton className="h-[26px] w-[118px] rounded-[7px] bg-[#17191a]" />
              </td>
              <td className={COL.created}>
                <Bar className="w-24" />
              </td>
              <td className={COL.lastUsed}>
                <Bar className="w-12" />
              </td>
              <td className={COL.action}>
                <Skeleton className="ml-auto h-9 w-[78px] rounded-full bg-[#17191a] pointer-coarse:h-11" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </LoadingRegion>
  );
}
