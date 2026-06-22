# Ultimate Toolkit — Plugin Template

A boilerplate for building plugins for [Ultimate Toolkit](https://utoolkit.vercel.app).

Clone this branch to start developing your own plugin with the full plugin API, including `PluginBase`, `FloatingWindow`, `ErrorBoundary`, and the plugin registry.

## Quick Start

```bash
git clone -b template/example-plugin https://github.com/Ege-BULUT/ultimate_toolkit_by_egebulut.git my-plugin
cd my-plugin
npm install
npm run dev
```

The app opens in your browser at `http://localhost:1420`. You'll see the Example Plugin card with a toggle switch.

## Project Structure

```
src/
├── plugins/
│   ├── core/               # Plugin system (do not modify)
│   │   ├── PluginBase.ts
│   │   ├── PluginRegistry.ts
│   │   ├── ErrorBoundary.tsx
│   │   └── FloatingWindow.tsx
│   └── example/            ← YOUR PLUGIN STARTS HERE
│       ├── index.tsx          # Main plugin class
│       ├── Config.tsx         # Settings page component
│       └── FloatingComponent.tsx  # Floating overlay component
├── types/
│   └── index.ts
├── utils/
│   └── storage.ts
├── App.tsx
└── main.tsx
```

## Building Your Plugin

1. **Copy** `src/plugins/example/` to `src/plugins/your-plugin/`
2. **Rename** the class and update the `PluginDefinition` metadata
3. **Implement** `onActivate()` and `onDeactivate()` lifecycle methods
4. **Optionally** add a Config component and/or a Floating UI component
5. **Register** it in `src/App.tsx`:

```tsx
import { YourPlugin } from "./plugins/your-plugin";
PluginRegistry.register(new YourPlugin());
```

## Plugin API

Full API reference: [Plugin API Docs](https://utoolkit.vercel.app/docs/v0.1.0/plugins/plugin-api)

### Key Classes

| Class | Purpose |
|-------|---------|
| `PluginBase` | Abstract class your plugin extends |
| `PluginRegistry` | Global registry for registering/enabling/disabling plugins |
| `FloatingWindow` | Draggable overlay window for your plugin's UI |
| `ErrorBoundary` | Catches render errors so one plugin crash doesn't take down the app |

### Storage

```typescript
import { Storage } from "../utils/storage";
await Storage.set("my-plugin.key", { data: "value" });
const value = await Storage.get("my-plugin.key", { data: "default" });
```

## Testing in the Real App

Once your plugin is ready, copy the plugin directory into the main app's `src/plugins/` folder, register it, and run `npm run tauri:dev` to test inside the desktop app.

## Publishing

Share your plugin by publishing the code on GitHub. A community plugin registry is coming soon.
