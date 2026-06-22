import { describe, it, expect, beforeEach } from "vitest";
import { PluginRegistry } from "../PluginRegistry";
import { PluginBase } from "../PluginBase";

class TestPlugin extends PluginBase {
  definition = {
    id: "test_plugin",
    name: "Test Plugin",
    description: "A plugin for testing",
    icon: "🧪",
    version: "1.0.0",
    author: "Test",
    hasFloatingUI: false,
  };

  onActivate() {}
  onDeactivate() {}
}

class FloatingPlugin extends PluginBase {
  definition = {
    id: "floating_test",
    name: "Floating Test",
    description: "A floating plugin for testing",
    icon: "🪟",
    version: "1.0.0",
    author: "Test",
    hasFloatingUI: true,
  };

  onActivate() {}
  onDeactivate() {}
}

describe("PluginRegistry", () => {
  beforeEach(() => {
    // Clear registry between tests by reaching into the plugins map
    // We need a fresh registry for each test
    const registry = PluginRegistry as unknown as { plugins: Map<string, PluginBase> };
    registry.plugins.clear();
  });

  it("registers a plugin", () => {
    const plugin = new TestPlugin();
    PluginRegistry.register(plugin);
    expect(PluginRegistry.get("test_plugin")).toBe(plugin);
  });

  it("returns undefined for unregistered plugin", () => {
    expect(PluginRegistry.get("nonexistent")).toBeUndefined();
  });

  it("warns on duplicate registration", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    PluginRegistry.register(new TestPlugin());
    PluginRegistry.register(new TestPlugin());
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("already registered"));
    spy.mockRestore();
  });

  it("returns all definitions", () => {
    PluginRegistry.register(new TestPlugin());
    PluginRegistry.register(new FloatingPlugin());

    const defs = PluginRegistry.getAllDefinitions();
    expect(defs).toHaveLength(2);
    expect(defs.map((d) => d.id)).toEqual(
      expect.arrayContaining(["test_plugin", "floating_test"])
    );
  });

  it("calls onActivate when activating", () => {
    const plugin = new TestPlugin();
    const spy = vi.spyOn(plugin, "onActivate");
    PluginRegistry.register(plugin);
    PluginRegistry.activate("test_plugin");
    expect(spy).toHaveBeenCalledOnce();
  });

  it("calls onDeactivate when deactivating", () => {
    const plugin = new TestPlugin();
    const spy = vi.spyOn(plugin, "onDeactivate");
    PluginRegistry.register(plugin);
    PluginRegistry.deactivate("test_plugin");
    expect(spy).toHaveBeenCalledOnce();
  });

  it("handles activate/deactivate for nonexistent plugin gracefully", () => {
    expect(() => PluginRegistry.activate("ghost")).not.toThrow();
    expect(() => PluginRegistry.deactivate("ghost")).not.toThrow();
  });

  it("includes hasFloatingUI in definitions", () => {
    PluginRegistry.register(new TestPlugin());
    PluginRegistry.register(new FloatingPlugin());

    const defs = PluginRegistry.getAllDefinitions();
    const testPlugin = defs.find((d) => d.id === "test_plugin");
    const floatingPlugin = defs.find((d) => d.id === "floating_test");

    expect(testPlugin?.hasFloatingUI).toBe(false);
    expect(floatingPlugin?.hasFloatingUI).toBe(true);
  });

  describe("registerFromModule", () => {
    it("registers a plugin from a module with default export", () => {
      const plugin = new TestPlugin();
      const mod = { default: plugin };
      const result = PluginRegistry.registerFromModule(mod);
      expect(result.success).toBe(true);
      expect(result.id).toBe("test_plugin");
      expect(PluginRegistry.get("test_plugin")).toBe(plugin);
    });

    it("registers a plugin from a module with named class export", () => {
      const mod = { MyPlugin: TestPlugin };
      const result = PluginRegistry.registerFromModule(mod as unknown as Record<string, unknown>);
      expect(result.success).toBe(true);
      expect(result.id).toBe("test_plugin");
      expect(PluginRegistry.get("test_plugin")).toBeDefined();
    });

    it("returns error when module has no PluginBase class", () => {
      const mod = { foo: "bar", baz: 42 };
      const result = PluginRegistry.registerFromModule(mod);
      expect(result.success).toBe(false);
      expect(result.error).toContain("PluginBase");
    });

    it("warns on duplicate registration via registerFromModule", () => {
      const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const mod = { default: new TestPlugin() };
      PluginRegistry.registerFromModule(mod);
      PluginRegistry.registerFromModule(mod);
      expect(spy).toHaveBeenCalledWith(expect.stringContaining("already registered"));
      spy.mockRestore();
    });
  });
});
