# v1.0.1 — Native Floating Windows Fix + Debug Logger

> **Release date:** 2026-06-23

## What's New in v1.0.1

### 🪟 Native Floating Windows (Fixed)

Floating windows now work properly on Windows as true independent OS windows:

- **Native title bar** — each floating window has a draggable titlebar with `-webkit-app-region: drag`
- **Always-on-top** — `WebviewWindowBuilder` with `always_on_top(true)`, windows stay above ALL apps
- **Independent** — windows persist when main app is minimized, can be moved/resized freely
- **Toolbar** — compact always-on-top button bar for quick plugin launch

### 🐛 Debug Logger

A built-in debug logging system for troubleshooting and development:

- **File logging** — logs written to `%APPDATA%/ultimate-toolkit/logs/app.log` with timestamps
- **Console capture** — `console.log/warn/error` automatically intercepted
- **Debug modal** — accessible from Settings > About > Debug Logs button
  - Color-coded log levels (log/warn/error)
  - Auto-scroll to latest entries
  - **Copy All** button to copy logs to clipboard
  - **Clear** button to reset logs

### 🏗️ Architecture Changes

- **Rust backend**: New `log_message` and `get_logs` Tauri commands using `chrono` crate
- **Frontend**: `useLogger` hook captures console output at module level
- **Version**: All packages bumped from 1.0.0 to 1.0.1

## v1.0.1 vs v1.0.0

### ✅ Fixed

| Issue | Fix |
|-------|-----|
| Floating windows broken on Windows | Native standalone windows with correct `always_on_top` |
| No runtime feedback in browser dev mode | `useAutoUpdate` catch block now sets `updateInfo` with `{available:false}` |
| Module-level hooks/refs in FloatingApp | Proper React component with useEffect inside component body |

### ✨ New

| Feature | Description |
|---------|-------------|
| Debug Logger | File-based logging with console capture |
| DebugPanel | Modal log viewer with Copy All button |
| Console interception | `console.log/warn/error` → timestamped log entries |

### 📝 Documentation

- All docs updated to v1.0.1
- Changelog page added for v1.0.1
- v0.1.0 docs archived

## What's Next

Planned for future releases:

- **Screen capture** — native Windows region capture
- **GitHub plugin browser** — Install plugins directly from GitHub
- **Multi-engine OCR** — PaddleOCR, TrOCR support
- **Plugin hot-reload** — dev mode auto-reload
- **Code signing** — Windows SmartScreen certification
