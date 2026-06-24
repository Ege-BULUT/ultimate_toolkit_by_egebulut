import React, { useEffect, useState } from "react";
import { PythonPluginBase } from "../core/PythonPluginBase";
import type { PluginDefinition } from "../../types";
import { isTauri } from "../../utils/tauri";

const pluginDefinition: PluginDefinition = {
  id: "python-ocr",
  name: "OCR (Python)",
  description:
    "Python-powered OCR with image overlay, drag-select word picking, and Ctrl+toggle. Requires Python + PySide6 + pytesseract.",
  icon: "🐍",
  version: "0.1.0",
  author: "Ege Bulut",
  hasFloatingUI: false,
};

export class PythonOCRPlugin extends PythonPluginBase {
  definition = pluginDefinition;
  pythonPluginId = "ocr_plugin";
}

export const PythonOCRConfig: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [pythonFound, setPythonFound] = useState<boolean | null>(null);

  useEffect(() => {
    console.log("PythonOCRConfig mounted, isTauri:", isTauri());
    if (isTauri()) {
      import("@tauri-apps/api/core").then(({ invoke }) => {
        invoke<boolean>("is_python_plugin_running", { id: "ocr_plugin" })
          .then((r) => { console.log("Python OCR running status:", r); setRunning(r); })
          .catch((err) => { console.error("Failed to check python plugin status:", err); });
      });
    }
  }, []);

  const handleLaunch = async () => {
    if (!isTauri()) { console.warn("Python OCR: not in Tauri mode"); return; }
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      console.log("Launching Python OCR...");
      await invoke("launch_python_plugin", { id: "ocr_plugin" });
      console.log("Python OCR launched successfully");
      setRunning(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Python OCR launch failed:", msg);
      setPythonFound(msg.includes("Python not found") ? false : null);
    }
  };

  const handleStop = async () => {
    if (!isTauri()) return;
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      console.log("Stopping Python OCR...");
      await invoke("stop_python_plugin", { id: "ocr_plugin" });
      console.log("Python OCR stopped");
      setRunning(false);
    } catch (err) {
      console.error("Python OCR stop failed:", err);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className="p-4 rounded-xl text-sm leading-relaxed"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text-muted)",
        }}
      >
        <p className="mb-2">
          Launches the <strong>Python OCR plugin</strong> as a separate window.
          Requires Python 3.10+ with PySide6, pytesseract, and Pillow installed.
        </p>
        <pre
          className="p-2 rounded-lg text-xs"
          style={{ background: "var(--color-surface-alt)", color: "var(--color-text-secondary)" }}
        >
          pip install PySide6 pytesseract pillow
        </pre>
      </div>

      {pythonFound === false && (
        <div
          className="p-3 rounded-lg text-sm"
          style={{ background: "#3d0000", border: "1px solid #e94560", color: "#e94560" }}
        >
          Python not found. Install Python 3.10+ from python.org
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleLaunch}
          disabled={running}
          className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: running ? "var(--color-surface)" : "var(--color-accent)",
            color: running ? "var(--color-text-muted)" : "#fff",
            border: "1px solid var(--color-border)",
            opacity: running ? 0.5 : 1,
          }}
        >
          {running ? "Running..." : "Launch Python OCR"}
        </button>
        <button
          onClick={handleStop}
          disabled={!running}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: !running ? "var(--color-surface)" : "#e94560",
            color: !running ? "var(--color-text-muted)" : "#fff",
            border: "1px solid var(--color-border)",
            opacity: !running ? 0.5 : 1,
          }}
        >
          Stop
        </button>
      </div>

      {running && (
        <div
          className="p-2 rounded-lg text-xs text-center"
          style={{ background: "#16213e", color: "#4ade80", border: "1px solid #0f3460" }}
        >
          Python OCR plugin is running in a separate window.
        </div>
      )}
    </div>
  );
};
