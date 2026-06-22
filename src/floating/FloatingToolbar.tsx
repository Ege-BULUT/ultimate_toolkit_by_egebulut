import React, { useState, useEffect, useRef } from "react";
import { isTauri } from "../utils/tauri";

interface FloatingToolbarProps {
  /** Called when a plugin's floating window should be toggled */
  onToggle: (pluginId: string) => void;
}

/**
 * FloatingToolbar — a small always-on-top window with quick-access buttons
 * for each plugin that supports floating UI.
 *
 * Used in two modes:
 * 1. Standalone Tauri window (`/?toolbar`) — always on top, minimal chrome
 * 2. Embedded in the main app sidebar
 */
const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ onToggle }) => {
  const [invoke, setInvoke] = useState<((cmd: string, args?: any) => Promise<any>) | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isTauri()) {
      import("@tauri-apps/api/core").then((mod) => {
        setInvoke(() => mod.invoke);
      });
    }
    // Apply vendor-prefixed CSS for draggable titlebar area
    if (toolbarRef.current) toolbarRef.current.style.setProperty("-webkit-app-region", "drag");
    if (btnRef.current) btnRef.current.style.setProperty("-webkit-app-region", "no-drag");
  }, []);

  const handleClick = (pluginId: string) => {
    const fn = invoke;
    if (fn) {
      fn("create_floating_window", { pluginId }).catch((err) => {
        console.warn("Floating window error:", err);
      });
    }
    onToggle(pluginId);
  };

  return (
    <div ref={toolbarRef} style={styles.toolbar}>
      <button
        ref={btnRef}
        style={styles.button}
        onClick={() => handleClick("ocr")}
        title="Open OCR"
      >
        <span style={styles.icon}>🔍</span>
      </button>
      <div style={styles.divider} />
      <button
        style={styles.button}
        onClick={() => handleClick("ai_chat")}
        title="Open AI Chat"
      >
        <span style={styles.icon}>🤖</span>
      </button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    height: "100%",
    padding: "0 8px",
    background: "var(--color-surface, #1c1c1e)",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    userSelect: "none" as any,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 10,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.15s",
  },
  icon: {
    fontSize: 22,
    lineHeight: 1,
  },
  divider: {
    width: 1,
    height: 28,
    background: "var(--color-border, #38383a)",
    margin: "0 2px",
  },
};

export default FloatingToolbar;
