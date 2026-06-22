import React from "react";
import { isTauri } from "../utils/tauri";

let tauriClose: ((pluginId: string) => void) | null = null;

// In Tauri mode, try to load the invoke function
if (isTauri()) {
  import("@tauri-apps/api/core").then((mod) => {
    tauriClose = (pluginId: string) => {
      mod.invoke("close_floating_window", { pluginId }).catch(() => {});
    };
  });
}

/**
 * Renders a plugin's floating component in a standalone Tauri window.
 * Detected by the main.tsx boot process via ?floating=pluginId.
 */
interface FloatingAppProps {
  pluginId: string;
}

const FloatingApp: React.FC<FloatingAppProps> = ({ pluginId }) => {
  const [loaded, setLoaded] = React.useState(false);
  const [Component, setComponent] = React.useState<React.FC<{ onClose: () => void }> | null>(null);

  React.useEffect(() => {
    // Dynamic import of the plugin's floating component
    const load = async () => {
      try {
        let mod: any;
        switch (pluginId) {
          case "ocr":
            mod = await import("../plugins/ocr");
            break;
          case "ai_chat":
            mod = await import("../plugins/ai_chat");
            break;
          default:
            return;
        }

        if (pluginId === "ocr" && mod.OCRFloating) {
          setComponent(() => mod.OCRFloating);
        } else if (pluginId === "ai_chat" && mod.AIChatFloating) {
          setComponent(() => mod.AIChatFloating);
        }
      } catch (err) {
        console.error("Failed to load floating component:", err);
      } finally {
        setLoaded(true);
      }
    };
    load();
  }, [pluginId]);

  const handleClose = () => {
    if (tauriClose) {
      tauriClose(pluginId);
    }
    // Fallback: try invoking directly
    if (isTauri()) {
      import("@tauri-apps/api/core").then((mod) => {
        mod.invoke("close_floating_window", { pluginId }).catch(() => {});
      });
    }
  };

  if (!Component) {
    return (
      <div style={styles.center}>
        {loaded ? (
          <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
            {pluginId} has no floating UI
          </p>
        ) : (
          <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Loading...</p>
        )}
      </div>
    );
  }

  return <Component onClose={handleClose} />;
};

const styles: Record<string, React.CSSProperties> = {
  center: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
};

export default FloatingApp;
