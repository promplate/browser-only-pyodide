import ErrorStackParser from "./vendor/stackframe/error-stack-parser";
import {
  IN_BROWSER_MAIN_THREAD,
  IN_BROWSER_WEB_WORKER,
} from "./environments";
import { Lockfile } from "./types";

declare var globalThis: {
  importScripts: (url: string) => void;
  document?: typeof document;
  fetch?: typeof fetch;
};

function browser_resolvePath(path: string, base?: string): string {
  if (base === undefined) {
    // @ts-ignore
    base = location;
  }
  return new URL(path, base).toString();
}

export let resolvePath: (rest: string, base?: string) => string;
resolvePath = browser_resolvePath;

/**
 * Get the path separator. If we are on Linux or in the browser, it's /.
 * In Windows, it's \.
 * @private
 */
export let pathSep: string;

/**
 * Load a binary file, only for use in browser. Resolves relative paths against
 * indexURL.
 *
 * @param path the path to load
 * @param subResourceHash the sub resource hash for fetch() integrity check
 * @returns A Uint8Array containing the binary data
 * @private
 */
function browser_getBinaryResponse(
  path: string,
  subResourceHash: string | undefined,
): { response: Promise<Response>; binary?: undefined } {
  const url = new URL(path, location as unknown as URL);
  let options = subResourceHash ? { integrity: subResourceHash } : {};
  return { response: fetch(url, options) };
}

/** @private */
export let getBinaryResponse: (
  path: string,
  file_sub_resource_hash?: string | undefined,
) =>
  | { response: Promise<Response>; binary?: undefined }
  | { response?: undefined; binary: Promise<Uint8Array> };
getBinaryResponse = browser_getBinaryResponse;

export async function loadBinaryFile(
  path: string,
  file_sub_resource_hash?: string | undefined,
): Promise<Uint8Array> {
  const { response, binary } = getBinaryResponse(path, file_sub_resource_hash);
  if (binary) {
    return binary;
  }
  const r = await response;
  if (!r.ok) {
    throw new Error(`Failed to load '${path}': request failed.`);
  }
  return new Uint8Array(await r.arrayBuffer());
}

/**
 * Currently loadScript is only used once to load `pyodide.asm.js`.
 * @param url
 * @async
 * @private
 */
export let loadScript: (url: string) => Promise<void>;

if (IN_BROWSER_MAIN_THREAD) {
  // browser
  loadScript = async (url) => await import(/* webpackIgnore: true */ url);
} else if (IN_BROWSER_WEB_WORKER) {
  // webworker
  loadScript = async (url) => {
    try {
      // use importScripts in classic web worker
      globalThis.importScripts(url);
    } catch (e) {
      // importScripts throws TypeError in a module type web worker, use import instead
      if (e instanceof TypeError) {
        await import(/* webpackIgnore: true */ url);
      } else {
        throw e;
      }
    }
  };
} else {
  throw new Error("Cannot determine runtime environment");
}


export async function loadLockFile(lockFileURL: string): Promise<Lockfile> {
  let response = await fetch(lockFileURL);
  return await response.json();
}

/**
 * Calculate the directory name of the current module.
 * This is used to guess the indexURL when it is not provided.
 */
export async function calculateDirname(): Promise<string> {

  let err: Error;
  try {
    throw new Error();
  } catch (e) {
    err = e as Error;
  }
  let fileName = ErrorStackParser.parse(err)[0].fileName!;

  const indexOfLastSlash = fileName.lastIndexOf(pathSep);
  if (indexOfLastSlash === -1) {
    throw new Error(
      "Could not extract indexURL path from pyodide module location",
    );
  }
  return fileName.slice(0, indexOfLastSlash);
}
