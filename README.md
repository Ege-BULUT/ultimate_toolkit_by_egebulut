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
- Write your own plugins! ([Guide](https://utoolkit.vercel.app/docs/custom-plugins))

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

Pre-built installers are available on the [Releases](https://github.com/egebulut/ultimate_toolkit_by_egebulut/releases) page.

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
│   ├── styles/             # Tailwind + CSS variables
│   ├── types/              # TypeScript types
│   └── utils/              # Tauri helpers, storage
├── src-tauri/              # Rust backend
│   └── src/plugins/        # Rust plugin implementations
├── ultimate_toolkit_web/   # Landing page (Vercel)
├── PLAN.md                 # Architecture & plan
├── ROADMAP.md              # Development roadmap
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

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

**Plugin developers**: Check out the [Custom Plugin Guide](https://utoolkit.vercel.app/docs/custom-plugins) and [Custom OCR Guide](https://utoolkit.vercel.app/docs/custom-ocr).

---

## 📄 License

MIT © [Ege Bulut](https://github.com/egebulut). See [LICENSE](./LICENSE).

---

## 🔗 Links

- [Website](https://utoolkit.vercel.app)
- [GitHub](https://github.com/egebulut/ultimate_toolkit_by_egebulut)
- [Docs](https://utoolkit.vercel.app/docs)
- [Report Bug](https://github.com/egebulut/ultimate_toolkit_by_egebulut/issues)
