# Plugin System

Ultimate Toolkit is built around a modular **plugin architecture**. Every tool you see in the app is a plugin, and you can create your own.

## Architecture

```
Plugin System
├── PluginDefinition     # Metadata (id, name, icon, version)
├── PluginBase           # Lifecycle (onActivate, onDeactivate)
├── PluginRegistry       # Global registry of all plugins
├── FloatingWindow       # Overlay window support
└── PluginConfig         # Per-plugin settings page
```

## Plugin Lifecycle

1. **Registration**: Plugin is added to the `PluginRegistry`
2. **Activation**: `onActivate()` is called when the plugin is enabled
3. **Running**: The plugin operates, potentially showing a floating window
4. **Deactivation**: `onDeactivate()` is called when the plugin is disabled

## Plugin States

Each plugin can be in one of three states: **Enabled**, **Disabled**, or **Error**.

See the [Creating Plugins](creating-plugins) guide for a step-by-step tutorial, or the [Plugin API Reference](plugin-api) for full documentation.