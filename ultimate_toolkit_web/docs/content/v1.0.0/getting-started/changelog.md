# v1.0.0 — Always-on-top Floating Windows + Toolbar

> **Release date:** 2026-06-23

## What's New in v1.0.0

### 🪟 Always-on-top Floating Windows

Floating UIs (OCR, AI Chat) now open as **separate OS windows** that stay on top of ALL applications — not just the main app window.

- Each floating window is a native Tauri window with `alwaysOnTop=true`
- Windows have no title bar for a clean, minimal look
- Windows persist even when the main app is minimized to the taskbar
- Each window can be moved and resized independently

### 🧰 Floating Toolbar

A small, always-on-top toolbar appears when the app starts, giving you quick access to floating plugin UIs without needing to focus the main window.

- Compact horizontal bar with plugin icon buttons
- Click a button to open that plugin's floating window
- Stays visible on screen at all times
- Draggable via the titlebar area

### 🔘 Pop Out Button

Every plugin config page now has a **Pop Out ↗** button that opens the plugin's floating UI as a separate always-on-top window.

### 📦 NSIS Installer

- Windows setup executable (admin rights not required)
- Auto-built by GitHub Actions on every `v*` tag push
- CI/CD pipeline: tests → TypeScript check → Rust build → release

### 🔍 Client-side Search

Docs now have a search bar with pre-built full-text index:
- Search across all 19 doc pages
- Results show title, category, and content snippet with highlighting
- Ctrl+F alternative for finding documentation

### 🧩 Plugin Template Branch

New `template/example-plugin` branch provides a complete boilerplate for plugin developers:
- Minimal app shell with the full plugin API
- Example plugin with Config page + Floating UI component
- README with quick-start guide
- CI workflow that validates the template

### 📚 Docs Improvements

- Client-side search across all documentation
- Expanded Plugin API Reference covering all new APIs:
  - `registerFromModule()` for external plugin loading
  - `ErrorBoundary` for crash isolation
  - `MarkdownRenderer` for rendering markdown
  - `useConversation` for chat persistence
  - Full TypeScript type documentation
- Versioned docs system (v0.1.0 archived, v1.0.0 current)

## Changes from v0.1.0

### ✅ New Features

| Feature | Description |
|---------|-------------|
| Always-on-top windows | Floating UIs as separate OS windows |
| Floating toolbar | Always-on-top button bar |
| Pop Out button | Native window from plugin config |
| Client-side search | Full-text docs search |
| Plugin template branch | `template/example-plugin` |
| NSIS installer | Setup.exe, auto-built by CI |
| Release workflow | Tag → build → GitHub Release |

### 🔧 Improvements

- **ErrorBoundary**: Plugin crash isolation with retry support
- **Custom Plugin Loader**: Load plugins from `.js`/`.mjs` files
- **MarkdownRenderer**: GFM markdown with syntax-highlighted code blocks
- **useConversation**: localStorage-based chat persistence with per-conversation IDs
- **Welcome screen**: First-visit onboarding with 4-step quick start
- **CI pipeline**: tsc check + 182 tests + cargo check + clippy
- **Cargo caching**: Second build ~3min instead of ~20min

### 📝 Documentation Updates

- All docs updated to reflect v1.0.0 features
- Added changelog page
- Plugin API Reference expanded with all new APIs
- Search index rebuilt for v1.0.0 content

## What's Next

Planned for future releases:

- **Screen capture** — native Windows region capture
- **GitHub plugin browser** — Install plugins directly from GitHub
- **Multi-engine OCR** — PaddleOCR, TrOCR support
- **Plugin hot-reload** — dev mode auto-reload
- **Code signing** — Windows SmartScreen certification
