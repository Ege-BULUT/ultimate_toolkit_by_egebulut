# Architecture

## Overview

Ultimate Toolkit uses a hybrid architecture:

- **Frontend**: React + TypeScript + Vite
- **Backend**: Rust + Tauri v2
- **Desktop**: Native Windows app via WebView2

## Window Architecture

v1.0.1 introduces a multi-window architecture:

- **Main window**: Full app UI (sidebar, plugin manager, settings)
- **Floating toolbar**: Small always-on-top window with plugin launcher buttons
- **Floating windows**: Separate OS windows for each plugin's floating UI (`alwaysOnTop=true`)

Floating windows are created via Rust commands using Tauri's `WebviewWindowBuilder` with `decorations=false` for a clean look. Each window loads the same frontend with a `?floating=pluginId` URL parameter, and the app renders only the relevant component.

## Plugin System

Plugins are self-contained modules that register with `PluginRegistry`. Each plugin extends `PluginBase` and implements lifecycle methods (`onActivate`/`onDeactivate`).

## Communication

- Frontend to Rust: Tauri `invoke()` commands
- Floating window creation: Rust `create_floating_window` command → `WebviewWindowBuilder`
- Cross-plugin: EventBus
- Persistence: localStorage (frontend), filesystem (Rust)