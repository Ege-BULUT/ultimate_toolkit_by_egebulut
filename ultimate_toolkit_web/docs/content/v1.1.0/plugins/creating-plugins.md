# Creating Plugins

Anyone can build a plugin for Ultimate Toolkit. This guide walks you through creating a Hello World plugin.

## Step 1: Create the Files

Create `src/plugins/hello/index.tsx`:

```typescript
import { PluginBase } from "../core/PluginBase";
import type { PluginDefinition } from "../../types";

const definition: PluginDefinition = {
  id: "hello",
  name: "Hello World",
  description: "A simple example plugin",
  icon: "hand",
  version: "0.1.0",
  author: "You",
  hasFloatingUI: false,
};

export class HelloPlugin extends PluginBase {
  definition = definition;
  onActivate() { console.log("Hello plugin activated!"); }
  onDeactivate() { console.log("Hello plugin deactivated."); }
}
```

## Step 2: Add a Config Page

Create `Config.tsx` and export it from your plugin's `index.tsx`.

## Step 3: Register the Plugin

In `src/App.tsx`:
```typescript
import { HelloPlugin } from "./plugins/hello";
import { PluginRegistry } from "./plugins/core/PluginRegistry";
PluginRegistry.register(new HelloPlugin());
```

## Step 4: Test

Run `npm run tauri:dev`, open Plugin Manager, toggle your plugin on.

For a full API reference, see the [Plugin API Reference](plugin-api).