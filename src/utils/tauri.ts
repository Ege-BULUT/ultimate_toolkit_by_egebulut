export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export async function tryInvoke<T>(
  cmd: string,
  args?: Record<string, unknown>,
  timeoutMs?: number
): Promise<T | undefined> {
  if (!isTauri()) return undefined;
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    const invokePromise = invoke<T>(cmd, args);
    if (timeoutMs && timeoutMs > 0) {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Command "${cmd}" timed out after ${timeoutMs}ms`)), timeoutMs)
      );
      return await Promise.race([invokePromise, timeoutPromise]);
    }
    return await invokePromise;
  } catch (err) {
    console.warn(`Tauri invoke "${cmd}" failed:`, err);
    return undefined;
  }
}
