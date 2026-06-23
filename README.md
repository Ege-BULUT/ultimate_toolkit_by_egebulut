# Ultimate Toolkit by EgeBulut 🛠️

**A modern, open-source Windows utility toolkit**, inspired by Microsoft PowerToys, built with [Tauri](https://tauri.app) + [React](https://react.dev) + [Rust](https://www.rust-lang.org/).

> Modular plugin architecture. Community extensions. Beautiful dark/light themes.

---

## ✨ Features

### 🔍 **OCR**: Optical Character Recognition
Extract text from images, screenshots, and screen regions using Tesseract OCR.
- 15+ languages (English pre-installed)
- Multi-language support
- Clipboard paste & recognize
- Screen capture integration
- [Custom OCR engine guide](https://utoolkit.vercel.app/docs/custom-ocr)

### 🤖 **AI Chat**: Multi-Provider AI Assistant
Chat with leading AI models, all from one floating window.
- **Ollama** (local, auto-detected)
- **OpenAI** (GPT-4o, GPT-4, GPT-3.5)
- **Anthropic** (Claude 3 Opus, Sonnet, Haiku)
- **Google Gemini** (Gemini 2.0 Flash, 1.5 Pro)
- **OpenRouter** (unified API for 200+ models)
- **DeepSeek** (DeepSeek Chat, Coder)
- **HuggingFace** (Llama, Mixtral, and more)

### 🧩 **Plugin System**
- Toggle plugins on/off individually
- Each plugin has its own configuration page
- Floating window support for quick access
- Crash isolation via ErrorBoundary — one bad plugin won't break the app
- Load custom plugins from `.js`/`.mjs` files without recompiling
- Write your own plugins! ([Guide](https://utoolkit.vercel.app/docs/custom-plugins))
- Clone the [template branch](https://github.com/Ege-BULUT/ultimate_toolkit_by_egebulut/tree/template/example-plugin) for a boilerplate starter

### ⚙️ **Smart Settings**
- Dark / Light / System theme
- Auto-update checker
- Per-plugin configuration

---

## 🚀 Quick Start

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

## 🏗️ Project Structure

```
ultimate_toolkit_by_egebulut/
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   ├── hooks/              # React hooks (theme, settings, updates)
│   ├── plugins/            # Plugin system
│   │   ├── core/           # PluginBase, Registry, FloatingWindow
│   │   ├── ocr/            # OCR plugin
│   │   └── ai_chat/        # AI Chat plugin
│   ├── styles/             # CSS variables + globals
│   ├── types/              # TypeScript types
│   └── utils/              # Storage, Tauri helpers
├── src-tauri/              # Rust backend
│   └── src/plugins/        # Rust plugin implementations
├── ultimate_toolkit_web/   # Landing page + docs SPA (Vercel)
│   └── docs/               # Versioned docs content + search index
├── .github/workflows/      # CI + Release (auto .exe build)
├── PLAN.md                 # Architecture & plan
└── TODO.md                 # Task tracking
```

---

## 🔧 Development

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
| `feat/*` | Feature branches → PR to DEV |
| `template/example-plugin` | Boilerplate for plugin developers |

Release builds are triggered by pushing a `v*` tag — see `.github/workflows/release.yml`.

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

**Plugin developers**: Start from the [template branch](https://github.com/Ege-BULUT/ultimate_toolkit_by_egebulut/tree/template/example-plugin), or check out the [Plugin API Docs](https://utoolkit.vercel.app/docs/v1.0.1/plugins/plugin-api).

---

## 📄 License

MIT © [Ege Bulut](https://github.com/egebulut). See [LICENSE](./LICENSE).

---

## 🔗 Links

- [Website](https://utoolkit.vercel.app)
- [GitHub](https://github.com/egebulut/ultimate_toolkit_by_egebulut)
- [Docs](https://utoolkit.vercel.app/docs/v1.0.1)
- [Plugin API Reference](https://utoolkit.vercel.app/docs/v1.0.1/plugins/plugin-api)
- [Plugin Template](https://github.com/Ege-BULUT/ultimate_toolkit_by_egebulut/tree/template/example-plugin)
- [Report Bug](https://github.com/egebulut/ultimate_toolkit_by_egebulut/issues)
