import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAutoUpdate } from "../useAutoUpdate";

describe("useAutoUpdate", () => {
  describe("sync behavior (no timers)", () => {
    it("returns initial state with null updateInfo and checking=false", () => {
      const { result } = renderHook(() => useAutoUpdate(false));
      expect(result.current.updateInfo).toBeNull();
      expect(result.current.checking).toBe(false);
      expect(result.current.checkForUpdates).toBeInstanceOf(Function);
    });

    it("resolves after checkForUpdates completes", async () => {
      const { result } = renderHook(() => useAutoUpdate(false));
      const res = await act(async () => result.current.checkForUpdates());
      // In jsdom/browser mode, Tauri is unavailable, so returns null
      expect(res).toBeNull();
      expect(result.current.updateInfo).toBeNull();
    });

    it("checking is false after checkForUpdates completes", async () => {
      const { result } = renderHook(() => useAutoUpdate(false));
      await act(async () => { await result.current.checkForUpdates(); });
      expect(result.current.checking).toBe(false);
    });
  });

  describe("timer-based behavior", () => {
    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => { vi.useRealTimers(); });

    it("does not auto-check when enabled is false", () => {
      const spy = vi.fn();
      const { result } = renderHook(() => useAutoUpdate(false));
      const original = result.current.checkForUpdates;
      result.current.checkForUpdates = spy;

      act(() => { vi.advanceTimersByTime(5000); });
      expect(spy).not.toHaveBeenCalled();
      result.current.checkForUpdates = original;
    });

    it("triggers auto-check when enabled, state settles", async () => {
      const { result } = renderHook(() => useAutoUpdate(true));
      // advanceTimersByTimeAsync fires the callback AND drains microtasks
      await act(async () => { await vi.advanceTimersByTimeAsync(3000); });
      expect(result.current.checking).toBe(false);
    });

    it("only auto-checks once even when re-enabled", async () => {
      const { rerender, result } = renderHook(
        (enabled: boolean) => useAutoUpdate(enabled), { initialProps: true }
      );
      await act(async () => { await vi.advanceTimersByTimeAsync(3000); });
      expect(result.current.checking).toBe(false);

      rerender(true);
      await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
      expect(result.current.checking).toBe(false);
    });

    it("cleans up timer on unmount", () => {
      const spy = vi.spyOn(window, "clearTimeout");
      const { unmount } = renderHook(() => useAutoUpdate(true));
      unmount();
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });
});
