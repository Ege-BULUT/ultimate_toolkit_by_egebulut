# Ultimate Toolkit — Plugin Template

A boilerplate for building plugins for [Ultimate Toolkit](https://utoolkit.vercel.app).

Clone this branch to start developing your own plugin with the full plugin API, including `PluginBase`, `FloatingWindow`, `ErrorBoundary`, localStorage persistence, and the plugin registry.

## Quick Start

```bash
git clone -b template/example-plugin https://github.com/Ege-BULUT/ultimate_toolkit_by_egebulut.git my-plugin
cd my-plugin
npm install
npm run dev
```

The app opens in your browser at `http://localhost:1420`. You'll see the Example Plugin card with a toggle switch.

## Included Examples

This template includes a fully working example plugin at `src/plugins/example/` that demonstrates:

| Feature | File | What it Shows |
|---------|------|---------------|
| **Plugin Lifecycle** | `index.tsx` | `onActivate()` / `onDeactivate()` hooks |
| **Config Panel** | `Config.tsx` | Text input, textarea, buttons, localStorage persistence |
| **Floating Window** | `FloatingComponent.tsx` | Counter with +/-/Reset, text input/output, localStorage |
| **Async Actions** | `Config.tsx` | Simulated async Tauri command call |
| **State Reset** | `Config.tsx` | Reset button to restore defaults |
| **Plugin Registration** | `App.tsx` | How to register any plugin in the registry |
| **Plugin Toggle** | App UI | Activate/deactivate plugin from the plugin card |

## Project Structure

```
src/
├── plugins/
│   ├── core/               # Plugin system (do not modify)
│   │   ├── PluginBase.ts       # Abstract class your plugin extends
│   │   ├── PluginRegistry.ts   # Global register/enable/disable
│   │   ├── ErrorBoundary.tsx   # Crash isolation wrapper
│   │   └── FloatingWindow.tsx  # Draggable overlay window
│   └── example/            ← COPY THIS TO CREATE YOUR PLUGIN
│       ├── index.tsx           # Main plugin class + PluginDefinition
│       ├── Config.tsx          # Settings page (text inputs, buttons, storage)
│       └── FloatingComponent.tsx  # Floating overlay (counter, text I/O)
├── types/
│   └── index.ts
├── utils/
│   └── storage.ts
├── App.tsx                  # Register plugins here
└── main.tsx
```

## Building Your Plugin

1. **Copy** `src/plugins/example/` to `src/plugins/your-plugin/`
2. **Rename** the class and update `PluginDefinition` metadata (id, name, icon, version)
3. **Implement** `onActivate()` and `onDeactivate()` lifecycle methods
4. **Customize** Config.tsx for your settings UI
5. **Customize** FloatingComponent.tsx for overlay UI (optional)
6. **Register** it in `src/App.tsx`:

```tsx
import { YourPlugin } from "./plugins/your-plugin";
PluginRegistry.register(new YourPlugin());
```

## Plugin API Reference

| Class | Purpose |
|-------|---------|
| `PluginBase` | Abstract class your plugin extends. Provides `onActivate()` and `onDeactivate()` |
| `PluginRegistry` | Global singleton. `register(plugin)`, `get(id)`, `enable(id)`, `disable(id)` |
| `FloatingWindow` | Wrapper component with drag/resize/close for overlay UIs |
| `ErrorBoundary` | Catches render errors in your plugin so the app stays running |

### Storage

```typescript
// localStorage-based persistence (works in browser and Tauri)
const KEY = "my-plugin.config";
const data = JSON.parse(localStorage.getItem(KEY) ?? "null") || { count: 0 };
localStorage.setItem(KEY, JSON.stringify(data));
```

### Floating Window Props

```tsx
<FloatingWindow title="My Plugin" icon="⭐" onClose={handleClose}>
  {/* Your content here */}
</FloatingWindow>
```

## Testing in the Real App

Once your plugin is ready, copy the plugin directory into the main app's `src/plugins/` folder, register it, and run `npm run tauri:dev` to test inside the desktop app with full Tauri API access (clipboard, OCR, AI chat, etc.).

## Publishing

Share your plugin by publishing the code on GitHub. A community plugin registry is coming soon.

For the full API documentation, visit [utoolkit.vercel.app](https://utoolkit.vercel.app/docs/v1.0.2/plugins/plugin-api).
