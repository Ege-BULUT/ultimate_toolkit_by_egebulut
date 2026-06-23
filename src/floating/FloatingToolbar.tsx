import React, { useState, useEffect, useRef } from "react";
import { isTauri } from "../utils/tauri";

interface FloatingToolbarProps {
  /** Called when a plugin's floating window should be toggled */
  onToggle: (pluginId: string) => void;
}

const TOOLBAR_BUTTONS = [
  { id: "ocr", icon: "🔍", label: "Open OCR" },
  { id: "ai_chat", icon: "🤖", label: "Open AI Chat" },
];

/**
 * FloatingToolbar — a small always-on-top window with quick-access buttons
 * for each plugin that supports floating UI.
 *
 * Used as a standalone Tauri window (`/?toolbar`) — always on top, minimal chrome.
 * Closeable via ✕ button or Escape key.
 */
const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ onToggle }) => {
  const [invoke, setInvoke] = useState<((cmd: string, args?: any) => Promise<any>) | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isTauri()) {
      import("@tauri-apps/api/core").then((mod) => {
        setInvoke(() => mod.invoke);
      });
    }
    // Apply vendor-prefixed CSS for draggable titlebar area (Tauri)
    if (toolbarRef.current) toolbarRef.current.style.setProperty("-webkit-app-region", "drag");
    // Mark all buttons as non-drag so they remain clickable
    buttonRefs.current.forEach((el, _) => el.style.setProperty("-webkit-app-region", "no-drag"));
    if (closeRef.current) closeRef.current.style.setProperty("-webkit-app-region", "no-drag");
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [invoke]);

  const handleClick = (pluginId: string) => {
    const fn = invoke;
    if (fn) {
      fn("create_floating_window", { pluginId }).catch((err) => {
        console.warn("Floating window error:", err);
      });
    }
    onToggle(pluginId);
  };

  const handleClose = () => {
    const fn = invoke;
    if (fn) {
      fn("hide_floating_toolbar").catch((err) => {
        console.warn("Failed to close toolbar:", err);
      });
    }
  };

  return (
    <div ref={toolbarRef} style={styles.toolbar}>
      {TOOLBAR_BUTTONS.map((btn) => (
        <button
          key={btn.id}
          ref={(el) => { if (el) buttonRefs.current.set(btn.id, el); }}
          style={styles.button}
          onClick={() => handleClick(btn.id)}
          title={btn.label}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-hover, rgba(255,255,255,0.1))")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <span style={styles.icon}>{btn.icon}</span>
        </button>
      ))}
      <div style={styles.divider} />
      <button
        ref={closeRef}
        style={styles.closeBtn}
        onClick={handleClose}
        title="Close toolbar (Escape)"
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,80,80,0.15)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <span style={styles.closeIcon}>✕</span>
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
    padding: "0 10px",
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
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.15s",
    marginLeft: 4,
  },
  closeIcon: {
    fontSize: 14,
    lineHeight: 1,
    color: "var(--color-text-tertiary, #8e8e93)",
  },
};

export default FloatingToolbar;
