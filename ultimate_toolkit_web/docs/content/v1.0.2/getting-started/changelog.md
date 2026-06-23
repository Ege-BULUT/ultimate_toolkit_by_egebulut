# v1.0.2 — Bug Fix Release

> **Release date:** 2026-06-23

## What's New in v1.0.2

### 🪟 Floating Toolbar — Now Usable

The always-on-top toolbar is no longer an unresponsive rectangle:

- **All buttons clickable** — fixed `-webkit-app-region` refs (both OCR and AI Chat buttons now have `no-drag`)
- **Closeable** — ✕ button added, Escape key also closes the toolbar
- **Wider** — toolbar expanded from 380px to 420px to accommodate close button

### ❌ Floating Buttons Removed from Main Window

The circular FABs (FloatingButton components) that were trapped inside the app window have been moved **to the floating toolbar**:

- Toolbar serves as the central quick-access launcher for all plugins
- Plugin floating windows are independent OS windows (unchanged)

### 🔄 Ollama Detection — Reliable

- **"Check Again" button** — manually retry detection after starting Ollama
- **Auto-retry** — re-checks when the app window gains focus (`visibilitychange` / `focus` events)
- **Better state feedback** — tri-state UI: "Checking..." / "✅ Running" / "❌ Not detected"
- **Non-Tauri mode** — immediately shows "not available" in browser dev mode

### 📋 OCR Clipboard — Now Works with Images

Clipboard paste finally handles images (screenshots), not just text:

- **Image paste** — `readImage()` from Tauri clipboard manager → Canvas → PNG → `perform_ocr`
- **File upload** — 📁 Upload Image button (both in Config page and floating window)
- **Fallback** — if clipboard has text, reads text; if image, OCRs it

### 🐛 Fixed

| Issue | Fix |
|-------|-----|
| Floating toolbar unclickable, unclosable | Fixed `-webkit-app-region` refs, added close button |
| Floating buttons stuck inside app window | Removed `renderFloatingButtons()`, toolbar handles launch |
| Ollama not detected even when running | Added "Check Again" + visibility/focus auto-retry |
| OCR clipboard paste didn't work for images | `readImage()` → Canvas PNG → `perform_ocr` + file upload |

---

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
