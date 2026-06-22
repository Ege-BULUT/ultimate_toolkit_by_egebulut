import React, { useRef, useState } from "react";
import { PluginRegistry } from "../plugins/core/PluginRegistry";

interface CustomPluginLoaderProps {
  onPluginLoaded: () => void;
}

export const CustomPluginLoader: React.FC<CustomPluginLoaderProps> = ({ onPluginLoaded }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setSuccess(null);

    if (!file.name.endsWith(".js") && !file.name.endsWith(".mjs")) {
      setError("Only .js and .mjs files are supported.");
      return;
    }

    try {
      const text = await file.text();
      const dataUri = "data:text/javascript;charset=utf-8," + encodeURIComponent(text);
      const mod = await import(/* @vite-ignore */ dataUri);
      const result = PluginRegistry.registerFromModule(mod);

      if (result.success) {
        setSuccess(`"${result.id}" loaded from ${file.name}`);
        onPluginLoaded();
      } else {
        setError(result.error ?? "Unknown error loading plugin.");
      }
    } catch (err) {
      setError(`Failed to load plugin: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div
      className="rounded-xl p-4 border-2 border-dashed text-center transition-all"
      style={{
        borderColor: error ? "var(--color-error, #e53e3e)" : "var(--color-border)",
        background: "var(--color-surface-alt)",
      }}
    >
      <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text-primary)" }}>
        Load Custom Plugin
      </p>
      <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
        Select a .js or .mjs file that exports a class extending <code>PluginBase</code>
      </p>

      <input
        ref={fileRef}
        type="file"
        accept=".js,.mjs"
        onChange={handleFile}
        className="hidden"
        data-testid="plugin-file-input"
      />
      <button
        onClick={() => fileRef.current?.click()}
        className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
        style={{
          background: "var(--color-accent)",
          color: "#fff",
        }}
      >
        Browse Files...
      </button>

      {error && (
        <p className="text-xs mt-2" style={{ color: "var(--color-error, #e53e3e)" }}>
          {error}
        </p>
      )}
      {success && (
        <p className="text-xs mt-2" style={{ color: "var(--color-success, #38a169)" }}>
          {success}
        </p>
      )}
    </div>
  );
};
