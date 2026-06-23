import React, { useState, useCallback, useEffect } from "react";
import { Sidebar, type Page } from "./components/Sidebar";
import { PluginManager } from "./plugins/core/PluginManager";
import { SettingsPanel } from "./components/SettingsPanel";
import { PluginRegistry } from "./plugins/core/PluginRegistry";
import { OCRPlugin } from "./plugins/ocr";
import { AIChatPlugin } from "./plugins/ai_chat";
import { PythonOCRPlugin, PythonOCRConfig } from "./plugins/python_ocr";
import { useTheme } from "./hooks/useTheme";
import { useSettings } from "./hooks/useSettings";
import { useAutoUpdate } from "./hooks/useAutoUpdate";
import { OCRConfig } from "./plugins/ocr";
import { AIChatConfig } from "./plugins/ai_chat";
import { Tooltip } from "./components/Tooltip";
import { Welcome } from "./components/Welcome";
import { DebugPanel } from "./components/DebugPanel";
import type { Theme } from "./types";
import { isTauri } from "./utils/tauri";

PluginRegistry.register(new OCRPlugin());
PluginRegistry.register(new AIChatPlugin());
PluginRegistry.register(new PythonOCRPlugin());

const PLUGIN_CONFIGS: Record<string, React.FC> = {
  ocr: OCRConfig,
  ai_chat: AIChatConfig,
  "python-ocr": PythonOCRConfig,
};

const App: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { settings, setAutoUpdate, togglePlugin } = useSettings();
  const { updateInfo, checking: checkingUpdate, checkForUpdates } = useAutoUpdate(settings.auto_update);

  const [activePage, setActivePage] = useState<Page>("plugins");
  const [showDebug, setShowDebug] = useState(false);

  // Spawn the always-on-top floating toolbar on app start (Tauri only)
  useEffect(() => {
    if (isTauri()) {
      (async () => {
        try {
          const { invoke } = await import("@tauri-apps/api/core");
          await invoke("show_floating_toolbar");
        } catch {}
      })();
    }
  }, []);

  // Derive active plugins set
  const activePlugins = new Set(
    settings.plugin_states.filter((p) => p.active).map((p) => p.id)
  );

  // Plugin sidebar list
  const pluginList = PluginRegistry.getAllDefinitions().map((p) => ({
    id: p.id,
    name: p.name,
    icon: p.icon,
  }));

  // ── Handlers ──────────────────────────────────────────────

  const handleTogglePlugin = useCallback(
    (id: string, active: boolean) => {
      togglePlugin(id, active);
    },
    [togglePlugin]
  );

  const handleOpenPlugin = useCallback((id: string) => {
    setActivePage(id);
  }, []);

  const handleToggleFloating = useCallback((id: string) => {
    if (isTauri()) {
      import("@tauri-apps/api/core").then((mod) => {
        mod.invoke("create_floating_window", { pluginId: id }).catch(() => {});
      });
    }
  }, []);

  const handleThemeChange = useCallback(
    (t: Theme) => {
      setTheme(t);
    },
    [setTheme]
  );

  // ── Render page content ───────────────────────────────────

  const renderContent = () => {
    if (activePage === "plugins") {
      return (
        <PluginManager
          activePlugins={activePlugins}
          onTogglePlugin={handleTogglePlugin}
          onOpenPlugin={handleOpenPlugin}
        />
      );
    }

    if (activePage === "settings") {
      return (
        <SettingsPanel
          theme={theme}
          autoUpdate={settings.auto_update}
          onThemeChange={handleThemeChange}
          onAutoUpdateChange={setAutoUpdate}
          updateInfo={updateInfo}
          checkingUpdate={checkingUpdate}
          onCheckUpdate={checkForUpdates}
          onOpenDebug={() => setShowDebug(true)}
        />
      );
    }

    // Plugin config page
    const ConfigComponent = PLUGIN_CONFIGS[activePage];
    if (ConfigComponent) {
      const pluginDef = PluginRegistry.get(activePage);
      return (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{pluginDef?.definition.icon}</span>
              <div>
                <h2 className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>
                  {pluginDef?.definition.name}
                </h2>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {pluginDef?.definition.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Tooltip text={activePlugins.has(activePage) ? "Deactivate plugin" : "Activate plugin"}>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={activePlugins.has(activePage)}
                    onChange={(e) => handleTogglePlugin(activePage, e.target.checked)}
                  />
                  <span className="toggle-slider" />
                </label>
              </Tooltip>

              {pluginDef?.definition.hasFloatingUI && activePlugins.has(activePage) && (
                <div className="flex items-center gap-2">
                  {isTauri() && (
                    <Tooltip text="Open in a separate always-on-top window">
                      <button
                        onClick={() => handleToggleFloating(activePage)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{
                          background: "var(--color-accent)",
                          color: "#fff",
                          border: "none",
                        }}
                      >
                        Open Floating Window
                      </button>
                    </Tooltip>
                  )}
                  {!isTauri() && (
                    <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                      Floating UI available in desktop app
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <ConfigComponent />
        </div>
      );
    }

    return null;
  };

  // ── Render floating UIs ───────────────────────────────────

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        pluginList={pluginList}
        activePlugins={activePlugins}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6" style={{ background: "var(--color-surface)" }}>
        {renderContent()}
      </main>

      {/* Floating Buttons - moved to FloatingToolbar window */}

      {/* Welcome / Onboarding - shows only on first visit */}
      <Welcome onDismiss={() => {}} />

      {/* Debug Panel */}
      {showDebug && <DebugPanel onClose={() => setShowDebug(false)} />}
    </div>
  );
};

export default App;
