import React, { useEffect, useRef } from "react";
import { isTauri } from "../utils/tauri";

const TOOLBAR_BUTTONS = [
  { id: "ocr", icon: "🔍", label: "Open OCR" },
  { id: "ai_chat", icon: "🤖", label: "Open AI Chat" },
];

let invokeFn: ((cmd: string, args?: Record<string, unknown>) => Promise<unknown>) | null = null;
if (isTauri()) {
  import("@tauri-apps/api/core").then((mod) => {
    invokeFn = mod.invoke;
    console.log("Toolbar: invoke loaded");
  }).catch((err) => {
    console.error("Toolbar: failed to load invoke:", err);
  });
}

const FloatingToolbar: React.FC = () => {
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("Toolbar mounted, isTauri:", isTauri());
    console.log("Toolbar: invokeFn available:", !!invokeFn);
    document.documentElement.style.setProperty("background", "transparent");
    document.body.style.setProperty("background", "transparent");
  }, []);

  const handleClick = (pluginId: string) => {
    console.log("Toolbar button clicked:", pluginId);
    if (invokeFn) {
      invokeFn("create_floating_window", { pluginId }).then(() => {
        console.log("Toolbar: floating window created for", pluginId);
      }).catch((err) => {
        console.error("Toolbar: floating window error for", pluginId, ":", err);
      });
    } else {
      console.error("Toolbar: invokeFn not loaded yet");
    }
  };

  const handleClose = () => {
    console.log("Toolbar close clicked");
    if (invokeFn) {
      invokeFn("hide_floating_toolbar").then(() => {
        console.log("Toolbar closed");
      }).catch((err) => {
        console.error("Toolbar close failed:", err);
      });
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") { console.log("Toolbar: Escape pressed"); handleClose(); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const baseBtn: React.CSSProperties = {
    width: 44, height: 44, borderRadius: 10, border: "none",
    background: "transparent", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "background 0.15s",
  };

  return (
    <div
      ref={toolbarRef}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 4, height: "100%", padding: "0 10px",
        background: "#1c1c1e",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        userSelect: "none",
      }}
    >
      {TOOLBAR_BUTTONS.map((btn) => (
        <button
          key={btn.id}
          style={baseBtn}
          onClick={() => handleClick(btn.id)}
          title={btn.label}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <span style={{ fontSize: 22, lineHeight: 1 }}>{btn.icon}</span>
        </button>
      ))}
      <div style={{ width: 1, height: 28, background: "#38383a", margin: "0 2px" }} />
      <button
        style={{ ...baseBtn, width: 36, height: 36, borderRadius: 8, marginLeft: 4 }}
        onClick={handleClose}
        title="Close toolbar (Escape)"
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,80,80,0.15)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <span style={{ fontSize: 14, lineHeight: 1, color: "#8e8e93" }}>✕</span>
      </button>
    </div>
  );
};

export default FloatingToolbar;
