# Ultimate Toolkit by EgeBulut 🛠️
<a href="https://utoolkit.vercel.app/" target="_blank"><img src="https://img.shields.io/badge/🌐_Website-utoolkit.vercel.app-8B5CF6?style=for-the-badge" alt="website" /></a>

**A modern, open-source Windows utility toolkit**, inspired by Microsoft PowerToys, built with [Tauri](https://tauri.app) + [React](https://react.dev) + [Rust](https://www.rust-lang.org/).

> Modular plugin architecture. Python plugin support. Community extensions. Beautiful dark/light themes.

<a href="https://utoolkit.vercel.app/docs/" target="_blank"><img src="https://img.shields.io/badge/🌐_Docs-utoolkit.vercel.app-8B5CF6?style=for-the-badge" alt="Documentation" /></a>

---

## Features

### **OCR**: Optical Character Recognition
Extract text from images, screenshots, and screen regions using Tesseract OCR.
- 15+ languages (English pre-installed)
- Multi-language support
- Clipboard paste & recognize
- Screen capture integration
- [Custom OCR engine guide](https://utoolkit.vercel.app/docs/custom-ocr)

### **AI Chat**: Multi-Provider AI Assistant
Chat with leading AI models, all from one floating window.
- **Ollama** (local, auto-detected)
- **OpenAI** (GPT-4o, GPT-4, GPT-3.5)
- **Anthropic** (Claude 3 Opus, Sonnet, Haiku)
- **Google Gemini** (Gemini 2.0 Flash, 1.5 Pro)
- **OpenRouter** (unified API for 200+ models)
- **DeepSeek** (DeepSeek Chat, Coder)
- **HuggingFace** (Llama, Mixtral, and more)

### **Python Plugin Support** (v1.1.0+)
Run Python scripts as native plugins with independent PySide6 windows.
- **Standalone Python processes** - the app launches `python {script}` as a child process
- **Automatic Python discovery** - finds Python on your system (common install paths)
- **Built-in Python OCR** - image overlay, drag-select word picking, Ctrl+toggle
- **Bring your own Python** - any PySide6 GUI script can be a plugin

### **Plugin System**
- Toggle plugins on/off individually
- Each plugin has its own configuration page
- Floating window support for quick access
- Crash isolation via ErrorBoundary - one bad plugin won't break the app
- Load custom plugins from `.js`/`.mjs` files without recompiling
- **Python plugins** - run Python scripts as native plugins (new in v1.1.0!)
- Write your own plugins! ([Guide](https://utoolkit.vercel.app/docs/custom-plugins))
- Clone the [template branch](https://github.com/Ege-BULUT/ultimate_toolkit_by_egebulut/tree/template/example-plugin) for a boilerplate starter

### **Smart Settings**
- Dark / Light / System theme
- Auto-update checker
- Per-plugin configuration

---

## Quick Start

### Prerequisites
- Windows 10/11
- [Rust](https://rustup.rs) (for building from source)
- Node.js 18+

### Install

```bash
# Clone the repository
git clone https://github.com/egebulut/ultimate_toolkit_by_egebulut.git
cd ultimate_toolkit_by_egebulut

# Install frontend dependencies
npm install

# Build & run (development mode)
npm run tauri:dev

# Build for production
npm run tauri:build
```

### Download

Pre-built installers are auto-built on every `v*` tag push and published to [GitHub Releases](https://github.com/egebulut/ultimate_toolkit_by_egebulut/releases).
You can also manually trigger a build from the Actions tab (`workflow_dispatch`).

---

## Project Structure

```
ultimate_toolkit_by_egebulut/
â”œâ”€â”€ plugins/              # Python plugin scripts (PySide6 standalone)
â”‚   â””â”€â”€ python/           #   ocr_plugin.py, more coming
â”œâ”€â”€ src/                    # React frontend
â”‚   â”œâ”€â”€ components/         # Reusable UI components
â”‚   â”œâ”€â”€ hooks/              # React hooks (theme, settings, updates)
â”‚   â”œâ”€â”€ plugins/            # Plugin system
â”‚   â”‚   â”œâ”€â”€ core/           # PluginBase, Registry, FloatingWindow, PythonPluginBase
â”‚   â”‚   â”œâ”€â”€ ocr/            # OCR plugin
â”‚   â”‚   â”œâ”€â”€ ai_chat/        # AI Chat plugin
â”‚   â”‚   â””â”€â”€ python_ocr/     # Python OCR plugin
â”‚   â”œâ”€â”€ styles/             # CSS variables + globals
â”‚   â”œâ”€â”€ types/              # TypeScript types
â”‚   â””â”€â”€ utils/              # Storage, Tauri helpers
â”œâ”€â”€ src-tauri/              # Rust backend
â”‚   â””â”€â”€ src/plugins/        # Rust plugin implementations (ocr, ai_chat, python_plugin)
â”œâ”€â”€ ultimate_toolkit_web/   # Landing page + docs SPA (Vercel)
â”‚   â””â”€â”€ docs/               # Versioned docs content + search index
â”œâ”€â”€ .github/workflows/      # CI + Release (auto .exe build)
â”œâ”€â”€ PLAN.md                 # Architecture & plan
â””â”€â”€ TODO.md                 # Task tracking
```

---

## Development

```bash
# Frontend dev (browser)
npm run dev

# Desktop app dev
npm run tauri:dev

# Build desktop app
npm run tauri:build
```

### Branch Strategy
| Branch | Purpose |
|--------|---------|
| `main` | Latest stable release |
| `DEV`  | Active development |
| `feat/*` | Feature branches â†’ PR to DEV |
| `template/example-plugin` | Boilerplate for plugin developers |

Release builds are triggered by pushing a `v*` tag - see `.github/workflows/release.yml`.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

**Plugin developers**: Start from the [template branch](https://github.com/Ege-BULUT/ultimate_toolkit_by_egebulut/tree/template/example-plugin), or check out the [Plugin API Docs](https://utoolkit.vercel.app/docs/v1.1.0/plugins/plugin-api) and the [Python Plugin Guide](https://utoolkit.vercel.app/docs/v1.1.0/plugins/python-plugins).

---

## License

MIT Â© [Ege Bulut](https://github.com/egebulut). See [LICENSE](./LICENSE).

---

## Links

- [Website](https://utoolkit.vercel.app)
- [GitHub](https://github.com/egebulut/ultimate_toolkit_by_egebulut)
- [Docs](https://utoolkit.vercel.app/docs/v1.1.0)
- [Plugin API Reference](https://utoolkit.vercel.app/docs/v1.1.0/plugins/plugin-api)
- [Python Plugin Guide](https://utoolkit.vercel.app/docs/v1.1.0/plugins/python-plugins)
- [Plugin Template](https://github.com/Ege-BULUT/ultimate_toolkit_by_egebulut/tree/template/example-plugin)
- [Report Bug](https://github.com/egebulut/ultimate_toolkit_by_egebulut/issues)
