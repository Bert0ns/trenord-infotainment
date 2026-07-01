/**
 * Async wrapper for a timeout
 * @example
 * ```ts
 * async function doSomething() {
 *    await wait(1000) // 1s delay
 *    return await doSomethingElse()
 * }
 * ```
 * @param ms time to wait in milliseconds
 * @returns void
 */
export async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Current UNIX timestamp in seconds */
export function nowSec(): number {
  return Math.floor(Date.now() / 1000);
}
