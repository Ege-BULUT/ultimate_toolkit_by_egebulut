import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSettings } from "../useSettings";

describe("useSettings", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns default settings", () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings.theme).toBe("system");
    expect(result.current.settings.auto_update).toBe(true);
    expect(result.current.settings.plugin_states).toEqual([
      { id: "ocr", active: false },
      { id: "ai_chat", active: false },
    ]);
  });

  it("persists settings to localStorage", () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.setAutoUpdate(false);
    });

    const saved = JSON.parse(localStorage.getItem("ut-settings")!);
    expect(saved.auto_update).toBe(false);
  });

  it("toggles plugin state", () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.togglePlugin("ocr", true);
    });

    expect(result.current.settings.plugin_states).toEqual([
      { id: "ocr", active: true },
      { id: "ai_chat", active: false },
    ]);
  });

  it("checks if plugin is active", () => {
    const { result } = renderHook(() => useSettings());

    expect(result.current.isPluginActive("ocr")).toBe(false);

    act(() => {
      result.current.togglePlugin("ocr", true);
    });

    expect(result.current.isPluginActive("ocr")).toBe(true);
  });

  it("returns false for unknown plugin", () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.isPluginActive("nonexistent")).toBe(false);
  });

  it("merges saved settings with defaults", () => {
    localStorage.setItem(
      "ut-settings",
      JSON.stringify({ auto_update: false, plugin_states: [] })
    );

    const { result } = renderHook(() => useSettings());
    // theme should come from defaults since it wasn't in saved
    expect(result.current.settings.theme).toBe("system");
    expect(result.current.settings.auto_update).toBe(false);
    expect(result.current.settings.plugin_states).toEqual([]);
  });

  it("sets theme via updateSetting", () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.setTheme("dark");
    });

    expect(result.current.settings.theme).toBe("dark");
  });

  it("handles corrupted localStorage gracefully", () => {
    localStorage.setItem("ut-settings", "not-json-at-all");
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings.theme).toBe("system");
    expect(result.current.settings.auto_update).toBe(true);
  });
});
