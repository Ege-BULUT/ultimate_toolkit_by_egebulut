import React, { useEffect, useState, useRef } from "react";
import { PluginBase } from "../core/PluginBase";
import type { PluginDefinition } from "../../types";
import { isTauri, tryInvoke } from "../../utils/tauri";
import { FloatingWindow } from "../core/FloatingWindow";
import { Tooltip } from "../../components/Tooltip";

// ── Plugin Definition ──────────────────────────────────────────

export const ocrPlugin: PluginDefinition = {
  id: "ocr",
  name: "OCR",
  description:
    "Extract text from screen regions, images, and screenshots using Tesseract OCR. Supports English, Turkish, and 15+ languages.",
  icon: "🔍",
  version: "0.1.0",
  author: "Ege Bulut",
  hasFloatingUI: true,
};

// ── OCR Plugin Class ───────────────────────────────────────────

export class OCRPlugin extends PluginBase {
  definition = ocrPlugin;

  onActivate() {
    console.log("OCR plugin activated");
  }

  onDeactivate() {
    console.log("OCR plugin deactivated");
  }
}

// ── React Config Component ─────────────────────────────────────

export const OCRConfig: React.FC = () => {
  const [languages, setLanguages] = useState<
    { code: string; name: string; installed: boolean }[]
  >([]);
  const [selectedLang, setSelectedLang] = useState("eng");
  const [engines, setEngines] = useState<{ id: string; name: string; available: boolean; description: string }[]>([]);
  const [selectedEngine, setSelectedEngine] = useState("tesseract");
  const [downloading, setDownloading] = useState(false);
  const [ocrResult, setOcrResult] = useState<string | null>(null);

  useEffect(() => {
    if (isTauri()) {
      tryInvoke<{ code: string; name: string; installed: boolean }[]>(
        "get_available_ocr_languages"
      ).then((langs) => {
        if (langs) setLanguages(langs);
      });
      tryInvoke<{ id: string; name: string; available: boolean; description: string }[]>(
        "get_available_ocr_engines"
      ).then((es) => {
        if (es) setEngines(es);
      });
    }
  }, []);

  const handleDownloadLang = async () => {
    setDownloading(true);
    await tryInvoke("download_language_data", { lang: selectedLang });
    setDownloading(false);
    // Refresh
    const langs = await tryInvoke<{ code: string; name: string; installed: boolean }[]>(
      "get_available_ocr_languages"
    );
    if (langs) setLanguages(langs);
  };

  const handleCaptureAndOCR = async () => {
    if (!isTauri()) {
      setOcrResult("OCR is only available in the desktop app.");
      return;
    }

    try {
      // ponytail: in real impl, we'd capture screen region via Tauri window API
      // For now, we use a placeholder image capture approach
      setOcrResult("Capturing screen region...");

      // Notify user about screenshot feature
      setOcrResult(
        "📸 Screen capture ready!\n\n" +
          "To use OCR:\n" +
          "1. Take a screenshot (Win+Shift+S)\n" +
          "2. Paste from clipboard (Ctrl+V)\n" +
          "3. The text will appear here\n\n" +
          "Or upload an image file using the button below."
      );
    } catch (err) {
      setOcrResult(`Error: ${err}`);
    }
  };

  const handlePasteFromClipboard = async () => {
    if (!isTauri()) {
      setOcrResult("Clipboard OCR is only available in the desktop app.");
      return;
    }

    try {
      const { readImage } = await import("@tauri-apps/plugin-clipboard-manager");
      try {
        const img = await readImage();
        if (img) {
          const rgba = await img.rgba();
          const size = await img.size();
          const canvas = document.createElement("canvas");
          canvas.width = size.width;
          canvas.height = size.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) { setOcrResult("Failed to create canvas context"); return; }
          ctx.putImageData(new ImageData(new Uint8ClampedArray(rgba), size.width, size.height), 0, 0);
          const base64 = canvas.toDataURL("image/png").split(",")[1] ?? "";

          setOcrResult("Processing clipboard image...");
          const res = await tryInvoke<{ text: string; confidence: number }>("perform_ocr", { imageBase64: base64, lang: selectedLang, engine: selectedEngine });
          if (res && res.text) {
            setOcrResult(`📷 OCR Result (${Math.round(res.confidence * 100)}% confidence):\n\n${res.text}`);
          } else {
            setOcrResult("No text found in the clipboard image.");
          }
          return;
        }
      } catch {
      }
      const { readText } = await import("@tauri-apps/plugin-clipboard-manager");
      const text = await readText();
      if (text) {
        setOcrResult(`📋 Clipboard text:\n\n${text}`);
      } else {
        setOcrResult("Clipboard is empty. Copy an image (Win+Shift+S) or text first, then click Paste & OCR.");
      }
    } catch (err) {
      setOcrResult(`Clipboard error: ${err}`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOcrResult("Processing uploaded file...");
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          if (typeof result === "string") { resolve(result.split(",")[1] ?? ""); }
          else { reject(new Error("Failed to read file as data URL")); }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await tryInvoke<{ text: string; confidence: number }>("perform_ocr", { imageBase64: base64, lang: selectedLang, engine: selectedEngine });
      if (res && res.text) {
        setOcrResult(`📁 OCR Result (${Math.round(res.confidence * 100)}% confidence):\n\n${res.text}`);
      } else {
        setOcrResult("No text found in the uploaded image.");
      }
    } catch (err) {
      setOcrResult(`File error: ${err}`);
    }
    e.target.value = "";
  };

  return (
    <div className="space-y-5">
      {/* Engine Selection */}
      <section>
        <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
          OCR Engine
        </h3>
        <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
          Choose the OCR engine. Tesseract is pre-installed; PaddleOCR can be installed separately for better accuracy on handwriting.
        </p>
        <div className="flex gap-2">
          {engines.map((e) => (
            <button
              key={e.id}
              onClick={() => setSelectedEngine(e.id)}
              disabled={!e.available}
              className="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                background: selectedEngine === e.id ? "var(--color-accent)" : "var(--color-surface)",
                color: selectedEngine === e.id ? "#fff" : (e.available ? "var(--color-text-primary)" : "var(--color-text-tertiary)"),
                border: "1px solid var(--color-border)",
                opacity: e.available ? 1 : 0.5,
                cursor: e.available ? "pointer" : "not-allowed",
              }}
            >
              <div className="font-medium">{e.name}</div>
              <div className="mt-0.5 opacity-70">{e.available ? "✅ Available" : "❌ Not installed"}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Language Selection */}
      <section>
        <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
          OCR Language
        </h3>
        <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
          Select the language for text recognition. English is pre-installed.
        </p>
        <div className="flex gap-2">
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg text-sm"
            style={{
              background: "var(--color-surface)",
              color: "var(--color-text-primary)",
              border: "1px solid var(--color-border)",
            }}
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name} ({l.code}) {l.installed ? "✓" : "- not installed"}
              </option>
            ))}
            {languages.length === 0 && (
              <>
                <option value="eng">English (eng) ✓</option>
                <option value="tur">Türkçe (tur)</option>
                <option value="deu">Deutsch (deu)</option>
                <option value="fra">Français (fra)</option>
              </>
            )}
          </select>
          <Tooltip text="Download selected language data for OCR">
            <button
              onClick={handleDownloadLang}
              disabled={downloading}
              className="px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap"
              style={{
                background: "var(--color-accent)",
                color: "#fff",
                opacity: downloading ? 0.6 : 1,
              }}
            >
              {downloading ? "Downloading..." : "Install Language"}
            </button>
          </Tooltip>
        </div>
      </section>

      {/* OCR Actions */}
      <section>
        <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
          Extract Text
        </h3>
        <div className="flex gap-2 mb-3">
          <Tooltip text="Paste an image from clipboard (screenshot) and extract text">
            <button
              onClick={handlePasteFromClipboard}
              className="flex-1 px-4 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                background: "var(--color-surface-hover)",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-border)",
              }}
            >
              📋 Paste & OCR
            </button>
          </Tooltip>
          <Tooltip text="Upload an image file for OCR">
            <label
              className="flex-1 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer text-center"
              style={{
                background: "var(--color-surface-hover)",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-border)",
              }}
            >
              📁 Upload Image
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </Tooltip>
          <Tooltip text="Capture a screen region for OCR">
            <button
              onClick={handleCaptureAndOCR}
              className="flex-1 px-4 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                background: "var(--color-surface-hover)",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-border)",
              }}
            >
              📸 Screen Capture
            </button>
          </Tooltip>
        </div>
      </section>

      {/* Result */}
      {ocrResult && (
        <section>
          <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
            Result
          </h3>
          <pre
            className="p-4 rounded-xl text-sm whitespace-pre-wrap font-mono leading-relaxed max-h-60 overflow-y-auto"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-primary)",
            }}
          >
            {ocrResult || "No text extracted yet. Use the buttons above to start."}
          </pre>
        </section>
      )}

      {/* Tips */}
      <div
        className="p-3 rounded-lg text-xs leading-relaxed"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text-muted)",
        }}
      >
        <strong>💡 Tips:</strong>
        <ul className="mt-1 list-disc list-inside space-y-0.5">
          <li>Use Win+Shift+S to take a screenshot, then press "Paste & OCR"</li>
          <li>English is pre-installed. Add more languages above.</li>
          <li>Higher resolution images produce better results.</li>
        </ul>
      </div>
    </div>
  );
};

// ── OCR Floating UI ────────────────────────────────────────────

export const OCRFloating: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [result, setResult] = useState<string | null>(null);
  const [lang] = useState("eng");
  const [engine] = useState("tesseract");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ocrBase64 = async (base64: string, label: string) => {
    setResult(`Processing ${label}...`);
    try {
      const res = await tryInvoke<{ text: string; confidence: number }>("perform_ocr", { imageBase64: base64, lang, engine });
      if (res && res.text) {
        setResult(`OCR Result (${Math.round(res.confidence * 100)}%):\n\n${res.text}`);
      } else if (res) {
        setResult("No text found in the image.");
      } else {
        setResult("OCR failed. If you are in browser mode, OCR requires the desktop app. If in the desktop app, ensure Tesseract is installed.");
      }
    } catch (err) {
      setResult(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handlePaste = async () => {
    if (!isTauri()) { setResult("OCR is only available in the desktop app."); return; }
    try {
      const { readImage, readText } = await import("@tauri-apps/plugin-clipboard-manager");
      try {
        const img = await readImage();
        if (img) {
          const rgba = await img.rgba();
          const size = await img.size();
          const canvas = document.createElement("canvas");
          canvas.width = size.width; canvas.height = size.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) { setResult("Failed to create canvas context"); return; }
          ctx.putImageData(new ImageData(new Uint8ClampedArray(rgba), size.width, size.height), 0, 0);
          const base64 = canvas.toDataURL("image/png").split(",")[1] ?? "";
          await ocrBase64(base64, "clipboard image");
          return;
        }
      } catch { /* no image */ }
      const text = await readText();
      if (text) { setResult(`📋 Clipboard text:\n\n${text}`); }
      else { setResult("Clipboard is empty. Copy an image (Win+Shift+S) first."); }
    } catch (err) { setResult(`Error: ${err}`); }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") { resolve(result.split(",")[1] ?? ""); }
        else { reject(new Error("Failed to read file as data URL")); }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    await ocrBase64(base64, "uploaded file");
    e.target.value = "";
  };

  return (
    <FloatingWindow title="OCR" icon="🔍" onClose={onClose}>
      <div className="flex flex-col gap-3 h-full">
        <button
          onClick={handlePaste}
          className="w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={{
            background: "var(--color-accent)",
            color: "#fff",
          }}
        >
          📋 Paste from Clipboard & OCR
        </button>
        <label
          className="w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer text-center"
          style={{
            background: "var(--color-surface-hover)",
            color: "var(--color-text-primary)",
            border: "1px solid var(--color-border)",
          }}
        >
          📁 Upload Image
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </label>
        {result && (
          <pre
            className="flex-1 p-3 rounded-lg text-xs font-mono whitespace-pre-wrap overflow-auto"
            style={{
              background: "var(--color-surface-alt)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-primary)",
            }}
          >
            {result}
          </pre>
        )}
      </div>
    </FloatingWindow>
  );
};
