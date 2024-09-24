// @ts-nocheck

/** @private */
export const IN_BROWSER = true;

/** @private */
export const IN_BROWSER_MAIN_THREAD =
  IN_BROWSER &&
  typeof window === "object" &&
  typeof document === "object" &&
  typeof document.createElement === "function" &&
  typeof sessionStorage === "object" &&
  typeof importScripts !== "function";

/** @private */
export const IN_BROWSER_WEB_WORKER =
  IN_BROWSER && typeof importScripts === "function" && typeof self === "object";

/** @private */
export const IN_SAFARI =
  typeof navigator === "object" &&
  typeof navigator.userAgent === "string" &&
  navigator.userAgent.indexOf("Chrome") == -1 &&
  navigator.userAgent.indexOf("Safari") > -1;

/**
 * Detects the current environment and returns a record with the results.
 * This function is useful for debugging and testing purposes.
 * @private
 */
export function detectEnvironment(): Record<string, boolean> {
  return {
    IN_BROWSER: IN_BROWSER,
    IN_BROWSER_MAIN_THREAD: IN_BROWSER_MAIN_THREAD,
    IN_BROWSER_WEB_WORKER: IN_BROWSER_WEB_WORKER,
    IN_SAFARI: IN_SAFARI,
  };
}
