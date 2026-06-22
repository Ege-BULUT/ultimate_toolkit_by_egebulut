import { useState, useCallback, useEffect, useRef } from "react";
import type { UpdateCheckResult } from "../types";

export function useAutoUpdate(enabled: boolean) {
  const [updateInfo, setUpdateInfo] = useState<UpdateCheckResult | null>(null);
  const [checking, setChecking] = useState(false);
  const notifiedRef = useRef(false);

  const checkForUpdates = useCallback(async () => {
    setChecking(true);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const result = await invoke<UpdateCheckResult>("check_for_updates");
      setUpdateInfo(result);
      return result;
    } catch (err) {
      console.error("Update check failed:", err);
      return null;
    } finally {
      setChecking(false);
    }
  }, []);

  // Auto-check on startup if enabled
  useEffect(() => {
    if (enabled && !notifiedRef.current) {
      notifiedRef.current = true;
      // Small delay to let the app render first
      const timer = setTimeout(() => checkForUpdates(), 3000);
      return () => clearTimeout(timer);
    }
  }, [enabled, checkForUpdates]);

  return { updateInfo, checking, checkForUpdates };
}
