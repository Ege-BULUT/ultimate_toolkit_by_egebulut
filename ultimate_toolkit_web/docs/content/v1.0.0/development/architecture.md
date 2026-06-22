# Architecture

## Overview

Ultimate Toolkit uses a hybrid architecture:

- **Frontend**: React + TypeScript + Vite
- **Backend**: Rust + Tauri v2
- **Desktop**: Native Windows app via WebView2

## Plugin System

Plugins are self-contained modules that register with `PluginRegistry`. Each plugin extends `PluginBase` and implements lifecycle methods.

## Communication

- Frontend to Rust: Tauri `invoke()` commands
- Cross-plugin: EventBus
- Persistence: localStorage (frontend), filesystem (Rust)