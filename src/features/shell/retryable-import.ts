type Tracked<T> = Promise<T> & {
  status?: "fulfilled" | "rejected";
  value?: T;
  reason?: unknown;
};

/**
 * A dynamic import for UI that loads on intent (the search palette, the
 * top-up form).
 *
 * - `load()` shares one request between every caller, so preloading on
 *   hover, focus or press never fetches twice and `use()` always sees the
 *   same promise. The settled result is recorded on the promise, which
 *   `use()` reads synchronously: a preloaded chunk renders with no fallback.
 * - A failure stays cached, so the suspended child re-renders into its error
 *   boundary instead of re-importing forever. `retry()` forgets a failed
 *   attempt; call it on new intent (open, hover, "Try again") so the next
 *   `load()` fetches the chunk again.
 */
export function retryableImport<T>(importer: () => Promise<T>) {
  let pending: Tracked<T> | null = null;

  function load(): Promise<T> {
    if (pending) return pending;
    const promise: Tracked<T> = importer().then(
      (value) => {
        promise.status = "fulfilled";
        promise.value = value;
        return value;
      },
      (error: unknown) => {
        promise.status = "rejected";
        promise.reason = error;
        throw error;
      },
    );
    pending = promise;
    return promise;
  }

  function retry() {
    if (pending?.status === "rejected") pending = null;
  }

  /** Starts (or restarts, after a failure) the import without waiting on it. */
  function preload() {
    retry();
    // Silent on purpose: the open path renders the failure with a retry.
    load().catch(() => {});
  }

  return { load, retry, preload };
}
