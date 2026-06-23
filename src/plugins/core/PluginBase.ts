import type { PluginDefinition } from "../../types";

/**
 * Base class for all plugins in the toolkit.
 * Each plugin extends this and registers via PluginRegistry.
 *
 * ponytail: simple class-based system; dynamic loading via import() when scale demands it.
 */
export abstract class PluginBase {
  public abstract definition: PluginDefinition;

  /** Called when plugin is activated (toggle ON) */
  abstract onActivate(): void | Promise<void>;

  /** Called when plugin is deactivated (toggle OFF) */
  abstract onDeactivate(): void | Promise<void>;

  /** Unique plugin identifier - matches `id` in definition */
  get id(): string {
    return this.definition.id;
  }
}
