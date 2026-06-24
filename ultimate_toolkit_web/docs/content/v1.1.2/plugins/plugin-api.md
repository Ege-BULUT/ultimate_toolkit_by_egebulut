Full API reference for building plugins for Ultimate Toolkit.

## PluginDefinition

The metadata object every plugin must define:

```typescript
interface PluginDefinition {
  /** Unique identifier. Used for storage and registry lookup. Must match the plugin class name pattern. */
  id: string;

  /** Human-readable name shown in the sidebar and plugin cards. */
  name: string;

  /** Short description shown in the plugin list. */
  description: string;

  /** Icon identifier. Use an emoji or icon name from react-icons. */
  icon: string;

  /** Semantic version of your plugin. */
  version: string;

  /** Author name or GitHub handle. Shown in the plugin card. */
  author: string;

  /** Whether this plugin shows a FloatingWindow overlay. */
  hasFloatingUI: boolean;

  /** Minimum app version required (optional). */
  minAppVersion?: string;
}
```

## PluginBase

Abstract class that every plugin extends:

```typescript
import { PluginBase } from "../plugins/core/PluginBase";

abstract class PluginBase {
  /** Plugin metadata. Every subclass must define this. */
  abstract definition: PluginDefinition;

  /** Called when the plugin is enabled. Initialize resources here. */
  onActivate(): void | Promise<void>;

  /** Called when the plugin is disabled. Clean up resources here. */
  onDeactivate(): void | Promise<void>;

  /** Optional React component for the plugin's settings page. */
  getConfigComponent?: React.FC;

  /** Optional React component for the floating overlay UI. */
  getFloatingComponent?: React.FC<FloatingProps>;
}
```

### Minimal Example

```typescript
import { PluginBase } from "../core/PluginBase";
import type { PluginDefinition } from "../types";

const definition: PluginDefinition = {
  id: "my-plugin",
  name: "My Plugin",
  description: "Does something useful",
  icon: "star",
  version: "0.1.0",
  author: "You",
  hasFloatingUI: false,
};

export class MyPlugin extends PluginBase {
  definition = definition;

  onActivate() {
    console.log("Plugin started");
  }

  onDeactivate() {
    console.log("Plugin stopped");
  }
}
```

## PluginRegistry

Global singleton that manages all plugins:

```typescript
import { PluginRegistry } from "../plugins/core/PluginRegistry";

class PluginRegistry {
  /** Register a plugin instance. Throws if id already registered. */
  static register(plugin: PluginBase): void;

  /** Get a plugin by id. */
  static get(id: string): PluginBase | undefined;

  /** Get all registered plugins. */
  static getAll(): PluginBase[];

  /** Enable a plugin (calls onActivate). */
  static enable(id: string): void;

  /** Disable a plugin (calls onDeactivate). */
  static disable(id: string): void;

  /** Check if a plugin is currently enabled. */
  static isEnabled(id: string): boolean;

  /** Get all currently enabled plugins. */
  static getEnabled(): PluginBase[];

  /** Load a plugin from an external module (e.g., custom plugin .js file).
   *  Accepts either a default export or a named export that extends PluginBase. */
  static registerFromModule(exports: Record<string, unknown>): boolean;
}
```

### registerFromModule

Used by the Custom Plugin system to load plugins from external `.js`/`.mjs` files:

```typescript
// The loader tries these in order:
// 1. exports.default (default export)
// 2. Any named export that extends PluginBase
// Returns true if a plugin was successfully registered.
const success = PluginRegistry.registerFromModule(moduleExports);
```

## ErrorBoundary

Wraps plugin config and floating UI components to isolate crashes:

```typescript
import { ErrorBoundary } from "../plugins/core/ErrorBoundary";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Optional custom error UI. Receives the error and a reset function. */
  fallback?: React.FC<{ error: Error; reset: () => void }>;
  /** Called when an error is caught. Useful for logging. */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

// Usage: wrap any plugin-rendered component
<ErrorBoundary onError={(err) => console.error(err)}>
  <MyPluginConfig />
</ErrorBoundary>
```

The default fallback shows a friendly message with a Retry button.

## FloatingWindow

Draggable, resizable overlay windows for plugins that need a persistent UI:

```typescript
import { FloatingWindow } from "../plugins/core/FloatingWindow";

interface FloatingWindowOptions {
  title: string;
  width: number;
  height: number;
  resizable?: boolean;   // default: true
  draggable?: boolean;   // default: true
  rememberPosition?: boolean; // default: false
}

interface FloatingProps {
  window: FloatingWindow;
  onClose: () => void;
}
```

### Example with Config + Floating UI

```typescript
import { PluginBase } from "../core/PluginBase";
import { FloatingWindow } from "../core/FloatingWindow";
import type { PluginDefinition, FloatingProps } from "../types";

const definition: PluginDefinition = {
  id: "notes",
  name: "Quick Notes",
  description: "Floating sticky notes",
  icon: "edit",
  version: "0.1.0",
  author: "You",
  hasFloatingUI: true,
};

export class NotesPlugin extends PluginBase {
  definition = definition;
  private floating: FloatingWindow | null = null;

  onActivate() {
    this.floating = new FloatingWindow({
      title: "Quick Notes",
      width: 360,
      height: 480,
      rememberPosition: true,
    });
  }

  onDeactivate() {
    this.floating?.destroy();
    this.floating = null;
  }

  getFloatingComponent = (props: FloatingProps) => {
    return <NotesPanel window={props.window} onClose={props.onClose} />;
  };
}

const NotesPanel: React.FC<FloatingProps> = ({ onClose }) => {
  return (
    <div>
      <textarea placeholder="Write your notes..." />
      <button onClick={onClose}>Close</button>
    </div>
  );
};
```

## MarkdownRenderer

Renders markdown strings as styled HTML. Used internally by AI Chat:

```typescript
import { MarkdownRenderer } from "../components/MarkdownRenderer";

interface MarkdownRendererProps {
  content: string;
}

// Usage
<MarkdownRenderer content="# Hello\n\nThis is **bold** text." />
```

Features:
- GitHub Flavored Markdown (tables, strikethrough, task lists)
- Automatic line breaks
- Syntax-highlighted code blocks (via CSS)
- Safe for trusted content (no sanitizer - designed for local app use)

## useConversation

React hook for persisting chat/session history to localStorage:

```typescript
import { useConversation } from "../hooks/useConversation";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

interface UseConversationReturn {
  messages: Message[];
  addMessage: (msg: Omit<Message, "id" | "timestamp">) => void;
  clearHistory: () => void;
}

// Usage
function ChatPanel() {
  const { messages, addMessage, clearHistory } = useConversation("my-chat");

  const send = (text: string) => {
    addMessage({ role: "user", content: text });
    // ... process and add response
    addMessage({ role: "assistant", content: "Response here" });
  };

  return (
    <div>
      {messages.map((m) => <div key={m.id}>{m.content}</div>)}
      <button onClick={clearHistory}>Clear</button>
    </div>
  );
}
```

Data is stored in localStorage under `ut-chat-{conversationId}`.

## Storage API

Persist plugin settings and data:

```typescript
import { Storage } from "../utils/storage";

// Store scoped plugin data
await Storage.set("my-plugin.key", { someValue: 42 });

// Retrieve with default
const data = await Storage.get("my-plugin.key", { someValue: 0 });

// Remove
await Storage.remove("my-plugin.key");
```

Plugin data is stored under the key prefix `plugin.{pluginId}.{key}` automatically when using the per-plugin config API.

## Events (EventBus)

Cross-plugin communication via events:

```typescript
import { EventBus } from "../utils/events";

// Emit
EventBus.emit("my-plugin:update", { data: "..." });

// Listen
const handler = (payload: any) => console.log(payload);
EventBus.on("my-plugin:update", handler);

// Clean up
EventBus.off("my-plugin:update", handler);
```

### Built-in Events

| Event | Payload | Description |
|-------|---------|-------------|
| `theme:changed` | `'dark' \| 'light'` | User switched theme |
| `settings:updated` | `{ key, value }` | A setting changed |
| `app:focus` | `void` | App window gained focus |
| `plugin:enabled` | `string` (plugin id) | A plugin was enabled |
| `plugin:disabled` | `string` (plugin id) | A plugin was disabled |

## TypeScript Types

Key types exported from the app:

```typescript
// src/types/index.ts

interface PluginDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  version: string;
  author: string;
  hasFloatingUI: boolean;
  minAppVersion?: string;
}

interface PluginConfig {
  enabled: boolean;
  settings: Record<string, unknown>;
}

interface FloatingProps {
  window: FloatingWindow;
  onClose: () => void;
}

type ThemeMode = "dark" | "light" | "system";

type PluginState = "enabled" | "disabled" | "error";
```

## Full Plugin Example

A complete plugin with config page, floating UI, and storage:

```typescript
// src/plugins/counter/index.tsx
import { PluginBase } from "../core/PluginBase";
import { FloatingWindow } from "../core/FloatingWindow";
import { Storage } from "../utils/storage";
import type { PluginDefinition, FloatingProps } from "../types";
import { CounterConfig } from "./Config";
import { CounterFloating } from "./Floating";

const definition: PluginDefinition = {
  id: "counter",
  name: "Counter",
  description: "A simple counter plugin example",
  icon: "counter",
  version: "0.1.0",
  author: "You",
  hasFloatingUI: true,
};

export class CounterPlugin extends PluginBase {
  definition = definition;
  private floating: FloatingWindow | null = null;

  async onActivate() {
    const saved = await Storage.get("counter.count", 0);
    console.log("Counter plugin loaded, saved count:", saved);
    this.floating = new FloatingWindow({
      title: "Counter",
      width: 300,
      height: 200,
      resizable: false,
    });
  }

  onDeactivate() {
    this.floating?.destroy();
    this.floating = null;
  }

  getConfigComponent = () => <CounterConfig />;
  getFloatingComponent = (props: FloatingProps) => (
    <CounterFloating window={props.window} onClose={props.onClose} />
  );
}
```

## Custom Plugins (External .js/.mjs)

Users can load plugins from external files without modifying the source code:

1. Click **Add Custom Plugin** in the Plugin Manager
2. Select a `.js` or `.mjs` file
3. The file must export a class extending `PluginBase`

```javascript
// my-plugin.js
import { PluginBase } from "./src/plugins/core/PluginBase";

export default class MyPlugin extends PluginBase {
  definition = {
    id: "external-plugin",
    name: "External Plugin",
    description: "Loaded from a file",
    icon: "package",
    version: "1.0.0",
    author: "Me",
    hasFloatingUI: false,
  };

  onActivate() {
    console.log("External plugin activated!");
  }

  onDeactivate() {
    console.log("External plugin deactivated.");
  }
}
```

## Best Practices

- **Use `onActivate` for setup**, `onDeactivate` for cleanup - never rely on constructor/destructor
- **Wrap your Config and Floating components** with `<ErrorBoundary>` for crash isolation
- **Use the Storage API** instead of raw localStorage for settings persistence
- **Use semantic versioning** for your plugin's `version` field
- **Set `hasFloatingUI: true`** only if your plugin actually needs an overlay window
- **Avoid heavy imports** in plugin entry files to keep activation fast
- **Use EventBus for cross-plugin communication** instead of direct imports between plugins
