# Ultimate Toolkit TODO

## Current Status: Phase 1 Foundation

| Status | Impact | Item | Substeps | Description |
|--------|--------|------|----------|-------------|
| ✅ | 🔥 | Project scaffolding | ✓ Directory structure ✓ Root configs ✓ .gitignore | Basic project skeleton |
| ✅ | 🔥 | Rust Tauri backend | ✓ Cargo.toml ✓ lib.rs ✓ main.rs ✓ tauri.conf.json ✓ capabilities | Tauri v2 backend with settings, plugins |
| ✅ | 🔥 | OCR Rust plugin | ✓ `perform_ocr` ✓ `get_available_ocr_languages` ✓ `download_language_data` | Tesseract OCR via `leptess` crate |
| ✅ | 🔥 | AI Chat Rust plugin | ✓ ollama check/list ✓ openai ✓ anthropic ✓ gemini ✓ openrouter ✓ deepseek ✓ huggingface | 7 providers with chat completion |
| ✅ | 🔥 | React frontend setup | ✓ Vite ✓ React ✓ TypeScript ✓ Tailwind ✓ CSS variables ✓ theme system | Modern frontend with dark/light/system |
| ✅ | 🔥 | Plugin system | ✓ PluginBase ✓ PluginRegistry ✓ PluginManager ✓ FloatingWindow | Extensible plugin architecture |
| ✅ | 🔥 | Settings system | ✓ Theme toggle ✓ Auto-update toggle ✓ Local storage persistence | User preferences |
| ✅ | 🔥 | OCR Plugin UI | ✓ Config page ✓ Language selection ✓ Paste & OCR ✓ Floating window | Full OCR user interface |
| ✅ | 🔥 | AI Chat Plugin UI | ✓ Config page ✓ Provider selection ✓ API key management ✓ Chat interface ✓ Floating window | Full AI Chat user interface |
| ✅ | 🔥 | Sidebar + Navigation | ✓ Plugin list ✓ Active indicators ✓ Settings link ✓ Tooltips | Main navigation |
| ⬜ | 🔥 | GitHub repo setup | ✓ Create repo ○ Push to main ○ Create DEV branch | GitHub repository |
| ⬜ | 🔥 | CI/CD pipeline | ○ GitHub Actions build ○ Auto-release on tags | Automated builds |
| ⬜ | 🔥 | npm install + build | ○ Install deps ○ Verify cargo build | First successful build |
| ⬜ | 🔥 | Auto-update system | ○ Tauri updater config ○ Update check UI ○ Self-update flow | In-app updates |
| ⬜ | 🟢 | Landing page website | ○ HTML/CSS/JS ○ Vercel deploy | `utoolkit.vercel.app` |
| ⬜ | 🟢 | Documentation | ✓ README.md ○ ROADMAP.md ○ CONTRIBUTING.md ○ LICENSE | Project docs |
| ⬜ | 🟢 | Custom plugin docs | ○ Custom OCR guide ○ Custom plugin guide | Developer docs |
| ⬜ | 🟢 | Tesseract data bundling | ○ Pre-download eng.traineddata ○ Auto-install on first run | First-run experience |

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Done |
| ⬜ | Not started |
| 🔥 | High impact |
| 🟢 | Medium impact |
| 🔵 | Low impact |

## Phase 2: Planned Features

- [ ] **Color Picker**: Eye dropper with color format conversion
- [ ] **Screen Ruler**: Measure pixels on screen
- [ ] **Find My Mouse**: Highlight cursor on Ctrl
- [ ] **Text Extractor**: Advanced OCR with region selection
- [ ] **Batch Rename**: File renaming utility
- [ ] **Keyboard Shortcut Manager**: Custom global hotkeys

## Phase 3: Ecosystem

- [ ] Community plugin store
- [ ] Plugin SDK & CLI
- [ ] Localization (i18n): TR, DE, FR, ES, JA, KO, ZH
- [ ] macOS / Linux support (Tauri makes this possible)
- [ ] Portable mode (no install, USB run)
