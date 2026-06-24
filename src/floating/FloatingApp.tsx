import React, { useEffect, useState } from "react";

interface FloatingAppProps {
  pluginId: string;
}

const FloatingApp: React.FC<FloatingAppProps> = ({ pluginId }) => {
  const [Component, setComponent] = useState<React.FC<{ onClose: () => void }> | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    console.log("FloatingApp mounted, pluginId:", pluginId);
    const load = async () => {
      try {
        let mod: any;
        switch (pluginId) {
          case "ocr":
            console.log("Loading OCR floating component...");
            mod = await import("../plugins/ocr");
            setComponent(() => mod.OCRFloating);
            console.log("OCR floating component loaded");
            break;
          case "ai_chat":
            console.log("Loading AIChat floating component...");
            mod = await import("../plugins/ai_chat");
            setComponent(() => mod.AIChatFloating);
            console.log("AIChat floating component loaded");
            break;
          default:
            console.warn("Unknown floating pluginId:", pluginId);
        }
      } catch (err) {
        console.error("FloatingApp load error for", pluginId, ":", err);
      } finally {
        setLoaded(true);
      }
    };
    load();
  }, [pluginId]);

  const handleClose = () => {
    console.log("Closing floating window for:", pluginId);
    import("@tauri-apps/api/core").then((mod) => {
      mod.invoke("close_floating_window", { pluginId }).then(() => {
        console.log("Floating window closed for:", pluginId);
      }).catch((err) => {
        console.error("Failed to close floating window:", err);
      });
    });
  };

  return (
    <div style={styles.wrapper}>
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
  body: { flex: 1, overflow: "auto" },
  bodyCenter: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center" },
};

export default FloatingApp;
