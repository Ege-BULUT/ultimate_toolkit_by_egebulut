import React, { useRef, useState } from "react";
import { PluginRegistry } from "../plugins/core/PluginRegistry";

interface CustomPluginLoaderProps {
  onPluginLoaded: () => void;
}

export const CustomPluginLoader: React.FC<CustomPluginLoaderProps> = ({ onPluginLoaded }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const resetMessages = () => { setError(null); setSuccess(null); };

  const registerModule = async (code: string, source: string) => {
    const dataUri = "data:text/javascript;charset=utf-8," + encodeURIComponent(code);
    const mod = await import(/* @vite-ignore */ dataUri);
    const result = PluginRegistry.registerFromModule(mod);
    if (result.success) {
      setSuccess(`"${result.id}" loaded from ${source}`);
      onPluginLoaded();
    } else {
      setError(result.error ?? "Unknown error loading plugin.");
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    resetMessages();
    if (!file.name.endsWith(".js") && !file.name.endsWith(".mjs")) {
      setError("Only .js and .mjs files are supported.");
      return;
    }
    try {
      const text = await file.text();
      await registerModule(text, file.name);
    } catch (err) {
      setError(`Failed to load plugin: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleGithubLoad = async () => {
    const url = githubUrl.trim();
    if (!url) return;
    resetMessages();
    setLoading(true);
    try {
      // Accept various URL formats:
      //   https://raw.githubusercontent.com/user/repo/branch/file.js
      //   https://github.com/user/repo/blob/main/file.js
      //   user/repo (fetches from main branch default path)
      let rawUrl = url;
      if (url.includes("github.com") && !url.includes("raw.githubusercontent.com")) {
        rawUrl = url
          .replace("github.com", "raw.githubusercontent.com")
          .replace("/blob/", "/");
      } else if (!url.startsWith("http")) {
        // bare user/repo format -> try dist/plugin.js on main
        rawUrl = `https://raw.githubusercontent.com/${url}/main/dist/plugin.js`;
      }
      const resp = await fetch(rawUrl);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
      const code = await resp.text();
      await registerModule(code, rawUrl);
    } catch (err) {
      setError(`GitHub load failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* File picker section */}
      <div
        className="rounded-xl p-4 border-2 border-dashed text-center transition-all"
        style={{
          borderColor: error ? "var(--color-error, #e53e3e)" : "var(--color-border)",
          background: "var(--color-surface-alt)",
        }}
      >
        <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text-primary)" }}>
          Load from File
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
          style={{ background: "var(--color-accent)", color: "#fff" }}
        >
          Browse Files...
        </button>
      </div>

      {/* GitHub section */}
      <div
        className="rounded-xl p-4 border-2 border-dashed text-center transition-all"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-surface-alt)",
        }}
      >
        <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text-primary)" }}>
          Add from GitHub
        </p>
        <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
          Paste a raw GitHub URL or <code>user/repo</code> to load a compiled plugin
        </p>

        <div className="flex gap-2">
          <input
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleGithubLoad(); }}
            placeholder="user/repo or raw GitHub URL..."
            className="flex-1 px-3 py-2 rounded-lg text-sm"
            style={{
              background: "var(--color-surface)",
              color: "var(--color-text-primary)",
              border: "1px solid var(--color-border)",
            }}
          />
          <button
            onClick={handleGithubLoad}
            disabled={loading || !githubUrl.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
            style={{
              background: "var(--color-accent)",
              color: "#fff",
              opacity: loading || !githubUrl.trim() ? 0.6 : 1,
            }}
          >
            {loading ? "Loading..." : "Load"}
          </button>
        </div>
        <p className="text-xs mt-2" style={{ color: "var(--color-text-muted)" }}>
          URL formats: <code>user/repo</code> · <code>github.com/user/repo/blob/main/file.js</code>
        </p>
      </div>

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
