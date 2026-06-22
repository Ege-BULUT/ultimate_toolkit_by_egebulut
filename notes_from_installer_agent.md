# Ultimate Toolkit by EgeBulut: Kurulum Notlari

## Proje Bilgisi
- **Proje**: Ultimate Toolkit by EgeBulut
- **Amaç**: Microsoft PowerToys benzeri, plugin tabanlı modern Windows araç seti
- **GitHub**: https://github.com/Ege-BULUT/ultimate_toolkit_by_egebulut
- **Website**: https://utoolkit.vercel.app (Vercel deploy bekliyor)
- **Lisans**: MIT

## Tech Stack
| Katman | Teknoloji |
|--------|-----------|
| Desktop Shell | **Tauri v2** (Rust) |
| Frontend | **React 18** + **TypeScript** + **Vite** |
| Styling | **Tailwind CSS v3** + CSS Variables (dark/light/system) |
| OCR Engine | **Tesseract** via `std::process::Command` (runtime binary) |
| AI Providers | Ollama, OpenAI, Anthropic, Gemini, OpenRouter, DeepSeek, HuggingFace |
| Auto-Update | **Tauri updater** + GitHub Releases |
| CI/CD | **GitHub Actions** (CI + Release workflows) |
| Website | **Static HTML/CSS/JS** → Vercel |

## Kurulum Adımları

### 1. Rust Kurulumu
```powershell
# rustup ile kuruldu
winget install Rust  # veya rustup-init.exe
# Versiyon: rustc 1.96.0, cargo 1.96.0
```

### 2. Proje İskeleti
```powershell
mkdir D:\projeler\ultimate_toolkit_by_egebulut
npm create tauri-app@latest  # TUI olmadığı için manuel kurulum yapıldı
```

### 3. Bağımlılıklar
```powershell
npm install
# Frontend: react, react-dom, react-icons, @tauri-apps/api v2, etc.
# Dev: typescript, vite, tailwindcss, @tauri-apps/cli v2
```

### 4. Rust Bağımlılıkları (Cargo.toml)
- `tauri` v2 (tray-icon feature ile)
- `tauri-plugin-updater`, `tauri-plugin-shell`, `tauri-plugin-dialog`, `tauri-plugin-clipboard-manager`
- `serde`, `serde_json`
- `reqwest` (json + blocking features)
- `tokio` (full)
- `base64`

**OCR**: `leptess` kullanıldı, sonra Tesseract binary discovery ile değiştirildi çünkü Windows'ta C kütüphane bağımlılığı sorun çıkarıyor. Runtime'da Tesseract binary'i PATH'te veya standart install dizinlerinde aranır.

### 5. Build Doğrulama
```powershell
# Frontend build
npx tsc --noEmit     # ✅ Pass
npx vite build       # ✅ Pass (4 output files)

# Rust build
cargo check          # ✅ Pass
```

### 6. GitHub Repo
```powershell
gh repo create ultimate_toolkit_by_egebulut --public
git push -u origin main
git checkout -b DEV && git push -u origin DEV
```

## Branch Stratejisi
- `main`: Latest stable release. Korunuyor.
- `DEV`: Aktif geliştirme. Tüm PR'lar buraya.
- `feat/*`: Feature branchleri, PR ile DEV'e gider

## Proje Yapısı
```
D:\projeler\ultimate_toolkit_by_egebulut\
├── .github/workflows/     # CI/CD pipelines
│   ├── ci.yml             # PR/DEV branch CI
│   └── release.yml        # Tag release build
├── src/                   # React Frontend
│   ├── components/        # UI bileşenleri
│   │   ├── Sidebar.tsx    # Sol navigasyon
│   │   ├── SettingsPanel.tsx
│   │   ├── PluginCard.tsx # Plugin toggle/kart
│   │   ├── FloatingButton.tsx
│   │   └── Tooltip.tsx    # Hover hint sistemi
│   ├── hooks/             # React hooks
│   │   ├── useTheme.ts    # Dark/light/system
│   │   ├── useSettings.ts # LocalStorage + state
│   │   └── useAutoUpdate.ts
│   ├── plugins/
│   │   ├── core/          # Plugin altyapısı
│   │   │   ├── PluginBase.ts
│   │   │   ├── PluginRegistry.ts
│   │   │   ├── PluginManager.tsx
│   │   │   └── FloatingWindow.tsx
│   │   ├── ocr/           # OCR plugin
│   │   └── ai_chat/       # AI Chat plugin
│   ├── styles/globals.css # Tailwind + tema
│   ├── types/index.ts     # TypeScript tipleri
│   └── utils/             # Yardımcılar
├── src-tauri/             # Rust Backend
│   ├── src/
│   │   ├── lib.rs         # App state + commands
│   │   ├── main.rs
│   │   └── plugins/
│   │       ├── mod.rs
│   │       ├── ocr.rs     # Tesseract OCR
│   │       └── ai_chat.rs # 7 AI provider
│   └── Cargo.toml
├── ultimate_toolkit_web/  # Vercel landing page
│   ├── index.html         # Ana sayfa
│   ├── docs.html          # Dokümantasyon (custom OCR, plugin guide, AI setup)
│   └── vercel.json
├── README.md
├── ROADMAP.md
├── TODO.md
├── PLAN.md
└── CONTRIBUTING.md
```

## İlk Pluginler

### OCR Plugin
- **Engine**: Tesseract (binary çağrısı)
- **Diller**: 15+ dil (eng pre-installed)
- **Özellikler**: Language download, clipboard paste, screen capture
- **Config**: Dil seçimi, install/uninstall
- **Floating UI**: Var (draggable, resizable)

### AI Chat Plugin
- **Providers**: Ollama (auto-detect), OpenAI, Anthropic, Gemini, OpenRouter, DeepSeek, HuggingFace
- **Özellikler**: API key management, model selection, provider switching, floating window
- **Ollama**: Otomatik algılama, model listeleme, local host config
- **Her provider**: API key input + "Get Key" link + hint text
- **Floating UI**: Var (provider switcher, chat interface)

## Önemli Notlar
1. **Tesseract**: Derleme için gerekli değil, runtime'da bulunmalı. Kullanıcı `winget install TesseractOCR` ile kurabilir.
2. **Auto-update**: Tauri updater plugin yapılandırıldı. GitHub Releases'den kontrol eder.
3. **Tauri build** için `TAURI_SIGNING_PRIVATE_KEY` env var gerekli (release için). Dev build'ler için gerekli değil.
4. **Vercel**: `ultimate_toolkit_web/` klasörü doğrudan deploy edilebilir. `vercel --cwd ultimate_toolkit_web`

## Dev Komutları
```powershell
# Frontend (browser)
npm run dev

# Tauri desktop dev
npm run tauri:dev

# Production build
npm run tauri:build
```
