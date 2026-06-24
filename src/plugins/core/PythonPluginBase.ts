import { PluginBase } from "./PluginBase";
import { isTauri } from "../../utils/tauri";

/**
 * Base class for Python-backed plugins.
 * Spawns a Python script as a child process on activate, kills it on deactivate.
 */
export abstract class PythonPluginBase extends PluginBase {
  /** The plugin_id used for Tauri commands. Must match the Rust-side key. */
  abstract pythonPluginId: string;

  async onActivate(): Promise<void> {
    console.log(`Python plugin "${this.definition.id}" onActivate called`);
    console.log("isTauri:", isTauri());
    if (!isTauri()) {
      console.warn(`${this.definition.id}: Python plugins require the Tauri desktop app`);
      return;
    }
    try {
      const { invoke } = await import("@tauri-apps/api/core");

      const scriptPath: string = await invoke("get_python_plugin_path", {
        pluginId: this.pythonPluginId,
      });
      console.log(`Python plugin script resolved: ${scriptPath}`);

      await invoke("launch_python_plugin", {
        id: this.pythonPluginId,
        scriptPath,
      });

      console.log(`Python plugin "${this.definition.id}" launched`);
    } catch (err) {
      console.error(`Failed to launch Python plugin "${this.definition.id}":`, err);
    }
  }

  async onDeactivate(): Promise<void> {
    console.log(`Python plugin "${this.definition.id}" onDeactivate called`);
    if (!isTauri()) return;
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("stop_python_plugin", { id: this.pythonPluginId });
      console.log(`Python plugin "${this.definition.id}" stopped`);
    } catch (err) {
      console.error(`Failed to stop Python plugin "${this.definition.id}":`, err);
    }
  }
}
