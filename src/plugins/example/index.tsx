import { PluginBase } from "../core/PluginBase";
import type { PluginDefinition } from "../../types";
import { ExampleConfig } from "./Config";
import { ExampleFloating } from "./FloatingComponent";

export { ExampleConfig, ExampleFloating };

const definition: PluginDefinition = {
  id: "example",
  name: "Example Plugin",
  description: "A template plugin — copy this to create your own",
  icon: "star",
  version: "1.0.0",
  author: "You",
  hasFloatingUI: true,
};

export class ExamplePlugin extends PluginBase {
  definition = definition;

  onActivate() {
    console.log("[Example] Plugin activated");
  }

  onDeactivate() {
    console.log("[Example] Plugin deactivated");
  }
}
