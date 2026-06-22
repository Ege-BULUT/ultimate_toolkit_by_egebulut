import React, { useState, useCallback } from "react";
import { PluginRegistry } from "./plugins/core/PluginRegistry";
import { ErrorBoundary } from "./plugins/core/ErrorBoundary";
import { ExamplePlugin, ExampleConfig, ExampleFloating } from "./plugins/example";
import { FloatingWindow } from "./plugins/core/FloatingWindow";

// ── Register your plugins here ──────────────────────────────
PluginRegistry.register(new ExamplePlugin());

const PLUGIN_CONFIGS: Record<string, React.FC> = {
  example: ExampleConfig,
};

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<string | null>(null);
  const [showFloating, setShowFloating] = useState(false);

  // Get all registered plugin definitions
  const plugins = PluginRegistry.getAllDefinitions();

  const handleToggle = useCallback((id: string) => {
    if (activePage === id) {
      PluginRegistry.deactivate(id);
      setActivePage(null);
    } else {
      PluginRegistry.activate(id);
      setActivePage(id);
    }
  }, [activePage]);

  const handleCloseFloating = useCallback(() => {
    setShowFloating(false);
  }, []);

  return (
    <div style={{
      padding: 32,
      maxWidth: 720,
      margin: "0 auto",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
        Ultimate Toolkit — Plugin Template
      </h1>
      <p style={{ color: "var(--color-text-secondary)", fontSize: 14, marginBottom: 32 }}>
        Edit <code>src/plugins/example/</code> to build your own plugin.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {plugins.map((def) => (
          <ErrorBoundary key={def.id}>
            <div style={{
              padding: 20,
              borderRadius: 12,
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <strong>{def.name}</strong>
                  <span style={{ color: "var(--color-text-muted)", fontSize: 13, marginLeft: 8 }}>
                    v{def.version}
                  </span>
                </div>
                <label style={{ position: "relative", display: "inline-block", width: 44, height: 24 }}>
                  <input
                    type="checkbox"
                    checked={activePage === def.id}
                    onChange={() => handleToggle(def.id)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: "absolute", cursor: "pointer", inset: 0,
                    borderRadius: 12, transition: "0.3s",
                    background: activePage === def.id ? "var(--color-accent)" : "var(--color-border)",
                  }}>
                    <span style={{
                      position: "absolute", left: 2, bottom: 2,
                      width: 20, height: 20, borderRadius: "50%",
                      background: "#fff", transition: "0.3s",
                      transform: activePage === def.id ? "translateX(20px)" : "none",
                    }} />
                  </span>
                </label>
              </div>
              <p style={{ color: "var(--color-text-secondary)", fontSize: 13, marginTop: 6 }}>
                {def.description}
              </p>

              {/* Config page */}
              {activePage === def.id && PLUGIN_CONFIGS[def.id] && (
                <div style={{ marginTop: 16 }}>
                  <ErrorBoundary key={def.id}>
                    {React.createElement(PLUGIN_CONFIGS[def.id]!)}
                  </ErrorBoundary>
                  {def.hasFloatingUI && (
                    <button
                      onClick={() => setShowFloating((v) => !v)}
                      style={{
                        marginTop: 12,
                        padding: "8px 16px",
                        borderRadius: 8,
                        border: "1px solid var(--color-border)",
                        background: "var(--color-accent)",
                        color: "#fff",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      {showFloating ? "Hide Floating Window" : "Show Floating Window"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </ErrorBoundary>
        ))}
      </div>

      {/* Floating window (rendered outside card) */}
      {showFloating && activePage === "example" && (
        <FloatingWindow
          title="Example Plugin"
          icon="&#11088;"
          onClose={handleCloseFloating}
        >
          <ErrorBoundary><ExampleFloating onClose={handleCloseFloating} /></ErrorBoundary>
        </FloatingWindow>
      )}
    </div>
  );
};

export default App;
