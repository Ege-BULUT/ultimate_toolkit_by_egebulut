import React, { useEffect, useState, useRef } from "react";
import { isTauri } from "../utils/tauri";

interface FloatingAppProps {
  pluginId: string;
}

const FloatingApp: React.FC<FloatingAppProps> = ({ pluginId }) => {
  const [Component, setComponent] = useState<React.FC<{ onClose: () => void }> | null>(null);
  const [loaded, setLoaded] = useState(false);
  const titleRef = useRef<HTMLDivElement>(null);

  const closeRef = useRef<HTMLButtonElement>(null);

  const title = pluginId === "ocr" ? "OCR" : pluginId === "ai_chat" ? "AI Chat" : pluginId;

  useEffect(() => {
    const load = async () => {
      try {
        let mod: any;
        switch (pluginId) {
          case "ocr":
            mod = await import("../plugins/ocr");
            setComponent(() => mod.OCRFloating);
            break;
          case "ai_chat":
            mod = await import("../plugins/ai_chat");
            setComponent(() => mod.AIChatFloating);
            break;
        }
      } catch (err) {
        console.error("FloatingApp load error:", err);
      } finally {
        setLoaded(true);
      }
    };
    load();
  }, [pluginId]);

  useEffect(() => {
    if (titleRef.current) titleRef.current.style.setProperty("-webkit-app-region", "drag");
    if (closeRef.current) closeRef.current.style.setProperty("-webkit-app-region", "no-drag");
  });

  const handleClose = () => {
    if (isTauri()) {
      import("@tauri-apps/api/core").then((mod) => {
        mod.invoke("close_floating_window", { pluginId }).catch(() => {});
      });
    }
  };

  return (
    <div style={styles.wrapper}>
      <div ref={titleRef} style={styles.titleBar}>
        <span style={styles.title}>{title}</span>
        <button ref={closeRef} onClick={handleClose} style={styles.closeBtn}>X</button>
      </div>
      <div style={Component ? styles.body : styles.bodyCenter}>
        {Component ? (
          <Component onClose={handleClose} />
        ) : (
          <p style={{ color: "var(--color-text-muted, #86868b)", fontSize: 13 }}>
            {loaded ? "No floating UI for this plugin" : "Loading..."}
          </p>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    overflow: "hidden",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background: "var(--color-surface, #1c1c1e)",
    color: "var(--color-text-primary, #f5f5f7)",
  },
  titleBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 12px",
    height: 36,
    flexShrink: 0,
    background: "var(--color-surface-alt, #2c2c2e)",
    borderBottom: "1px solid var(--color-border, #38383a)",
    userSelect: "none",
  },
  title: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-secondary, #a1a1a6)",
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    border: "none",
    background: "transparent",
    color: "var(--color-text-secondary, #a1a1a6)",
    cursor: "pointer",
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1, overflow: "auto" },
  bodyCenter: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center" },
};

export default FloatingApp;
