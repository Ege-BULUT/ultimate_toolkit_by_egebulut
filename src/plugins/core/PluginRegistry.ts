import { PluginBase } from "./PluginBase";
import type { PluginDefinition } from "../../types";

/**
 * Central registry for all plugins.
 * Plugins self-register via the `register()` call.
 */
class PluginRegistryClass {
  private plugins = new Map<string, PluginBase>();

  /** Register a plugin instance */
  register(plugin: PluginBase): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin "${plugin.id}" already registered - skipping`);
      return;
    }
    this.plugins.set(plugin.id, plugin);
  }

  /** Register a plugin from a dynamically loaded module */
  registerFromModule(mod: Record<string, unknown>): { success: boolean; id?: string; error?: string } {
    if (!mod.default || !(mod.default instanceof PluginBase)) {
      // Try named export: look for a class extending PluginBase
      const PluginClass = Object.values(mod).find(
        (v): v is new (...args: never[]) => PluginBase =>
          typeof v === "function" && v.prototype instanceof PluginBase
      );
      if (!PluginClass) {
        return { success: false, error: "Module must export a class extending PluginBase as default or named export" };
      }
      const instance = new PluginClass();
      this.register(instance);
      return { success: true, id: instance.id };
    }
    const instance = mod.default as PluginBase;
    this.register(instance);
    return { success: true, id: instance.id };
  }

  /** Get a plugin by ID */
  get(id: string): PluginBase | undefined {
    return this.plugins.get(id);
  }

  /** Get all registered plugin definitions */
  getAllDefinitions(): PluginDefinition[] {
    return Array.from(this.plugins.values()).map((p) => p.definition);
  }

  /** Activate a plugin */
  activate(id: string): void {
    const plugin = this.plugins.get(id);
    if (plugin) plugin.onActivate();
  }

  /** Deactivate a plugin */
  deactivate(id: string): void {
    const plugin = this.plugins.get(id);
    if (plugin) plugin.onDeactivate();
  }
}

export const PluginRegistry = new PluginRegistryClass();
