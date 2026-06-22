import { useState, useCallback } from "react";
import type { AppSettings, Theme } from "../types";

const STORAGE_KEY = "ut-settings";

const defaults: AppSettings = {
  theme: "system",
  auto_update: true,
  plugin_states: [
    { id: "ocr", active: false },
    { id: "ai_chat", active: false },
  ],
};

export function useSettings() {
  const [settings, setSettingsState] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as AppSettings;
        // Merge with defaults in case new fields were added
        return { ...defaults, ...parsed };
      }
    } catch {}
    return defaults;
  });

  const saveSettings = useCallback((s: AppSettings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }, []);

  const updateSetting = useCallback(<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettingsState((prev) => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
  }, [saveSettings]);

  const setTheme = useCallback(
    (theme: Theme) => updateSetting("theme", theme),
    [updateSetting]
  );

  const setAutoUpdate = useCallback(
    (enabled: boolean) => updateSetting("auto_update", enabled),
    [updateSetting]
  );

  const togglePlugin = useCallback(
    (id: string, active: boolean) => {
      setSettingsState((prev) => {
        const next = {
          ...prev,
          plugin_states: prev.plugin_states.map((p) =>
            p.id === id ? { ...p, active } : p
          ),
        };
        saveSettings(next);
        return next;
      });
    },
    [saveSettings]
  );

  const isPluginActive = useCallback(
    (id: string) => {
      return settings.plugin_states.find((p) => p.id === id)?.active ?? false;
    },
    [settings.plugin_states]
  );

  return {
    settings,
    updateSetting,
    setTheme,
    setAutoUpdate,
    togglePlugin,
    isPluginActive,
  };
}
