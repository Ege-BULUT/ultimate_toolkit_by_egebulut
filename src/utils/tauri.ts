/**
 * Check if running inside Tauri (vs browser dev mode)
 */
export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/**
 * Safely invoke a Tauri command, returning undefined on failure.
 * Useful for commands that are optional or may not exist yet.
 */
export async function tryInvoke<T>(
  cmd: string,
  args?: Record<string, unknown>
): Promise<T | undefined> {
  if (!isTauri()) return undefined;
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    return await invoke<T>(cmd, args);
  } catch (err) {
    console.warn(`Tauri invoke "${cmd}" failed:`, err);
    return undefined;
  }
}
