import { describe, it, expect, vi, beforeEach } from "vitest";
import { isTauri, tryInvoke } from "../tauri";

describe("tauri utils", () => {
  beforeEach(() => {
    delete (globalThis as Record<string, unknown>)["__TAURI_INTERNALS__"];
  });

  describe("isTauri", () => {
    it("returns false when not in Tauri", () => {
      expect(isTauri()).toBe(false);
    });

    it("returns true when __TAURI_INTERNALS__ exists", () => {
      (globalThis as Record<string, unknown>)["__TAURI_INTERNALS__"] = {};
      expect(isTauri()).toBe(true);
    });
  });

  describe("tryInvoke", () => {
    it("returns undefined when not in Tauri", async () => {
      const result = await tryInvoke("some_command");
      expect(result).toBeUndefined();
    });

    it("returns undefined on invoke error", async () => {
      (globalThis as Record<string, unknown>)["__TAURI_INTERNALS__"] = {};
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const result = await tryInvoke("fail_cmd");
      expect(result).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
