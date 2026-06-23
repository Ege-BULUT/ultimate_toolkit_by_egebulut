# Plugin System

Ultimate Toolkit is built around a modular **plugin architecture**. Every tool you see in the app is a plugin, and you can create your own.

## Plugin Types

There are two types of plugins:

- **JavaScript/TypeScript plugins** — compile into the app, full access to React UI framework, floating windows, and Tauri API
- **Python plugins** (v1.1.0+) — run as independent Python processes with native PySide6 windows. Ideal for leveraging the Python ecosystem (OCR, ML, data processing).

See the [Creating Plugins](creating-plugins) guide for JS/TS plugins, or [Python Plugins](python-plugins) for Python-powered plugins.

## Architecture

```
Plugin System
├── PluginDefinition     # Metadata (id, name, icon, version)
├── PluginBase           # Lifecycle (onActivate, onDeactivate)
├── PythonPluginBase     # Python plugin lifecycle (PythonPluginBase)
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
