import { useState, useCallback, useEffect } from "react";
import { isTauri } from "../utils/tauri";

interface LogEntry {
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG";
  message: string;
}

const MAX_LOGS = 500;

// Global state shared across components
let globalLogs: LogEntry[] = [];
let listeners: Array<() => void> = [];

function addLog(level: LogEntry["level"], message: string) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString().slice(11, 23),
    level,
    message,
  };
  globalLogs = [...globalLogs.slice(-(MAX_LOGS - 1)), entry];
  listeners.forEach((l) => l());

  // Send to Rust backend for file logging
  if (isTauri()) {
    import("@tauri-apps/api/core")
      .then((mod) => mod.invoke("log_message", { level, message }))
      .catch(() => {});
  }
}

export function useLogger() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  const logs = globalLogs;

  const info = useCallback((msg: string) => addLog("INFO", msg), []);
  const warn = useCallback((msg: string) => addLog("WARN", msg), []);
  const error = useCallback((msg: string) => addLog("ERROR", msg), []);
  const debug = useCallback((msg: string) => addLog("DEBUG", msg), []);

  const clear = useCallback(() => {
    globalLogs = [];
    listeners.forEach((l) => l());
  }, []);

  const copyLogs = useCallback(async () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.level}] ${l.message}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  }, [logs]);

  return { logs, info, warn, error, debug, clear, copyLogs };
}

// Capture console methods automatically
if (typeof console !== "undefined") {
  const origLog = console.log;
  const origWarn = console.warn;
  const origError = console.error;

  console.log = (...args) => {
    origLog.apply(console, args);
    addLog("INFO", args.map(String).join(" "));
  };
  console.warn = (...args) => {
    origWarn.apply(console, args);
    addLog("WARN", args.map(String).join(" "));
  };
  console.error = (...args) => {
    origError.apply(console, args);
    addLog("ERROR", args.map(String).join(" "));
  };
}
