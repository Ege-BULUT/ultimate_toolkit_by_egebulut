import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTheme } from "../useTheme";

describe("useTheme", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    vi.stubGlobal("matchMedia", vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-color-scheme: dark)" ? false : false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })));
  });

  it("defaults to system theme", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("system");
  });

  it("reads saved theme from localStorage", () => {
    localStorage.setItem("ut-theme", JSON.stringify("dark"));
    // The hook reads raw string, not JSON
    localStorage.setItem("ut-theme", "dark");
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("dark");
  });

  it("sets theme and persists to localStorage", () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme("light");
    });

    expect(result.current.theme).toBe("light");
    expect(localStorage.getItem("ut-theme")).toBe("light");
  });

  it("applies dark class when setting dark theme", () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme("dark");
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("removes dark class when setting light theme", () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme("light");
    });

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("returns the same setTheme function reference on re-render", () => {
    const { result, rerender } = renderHook(() => useTheme());
    const firstSetTheme = result.current.setTheme;
    rerender();
    expect(result.current.setTheme).toBe(firstSetTheme);
  });
});
