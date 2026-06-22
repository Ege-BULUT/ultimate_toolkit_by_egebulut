# Ultimate Toolkit by EgeBulut — Implementation Plan

## Vision
A modern, open-source Windows utility toolkit (inspired by Microsoft PowerToys) built with Tauri + React + Rust. Users can install, configure, and toggle plugins — including community-developed ones.

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Desktop Shell | **Tauri v2** (Rust) |
| Frontend | **React 18** + **TypeScript** + **Vite** |
| Styling | **Tailwind CSS v3** + CSS variables for theming |
| State | React Context + custom hooks |
| OCR Engine | **Tesseract** via `leptess` Rust crate (default), **PaddleOCR** (optional) |
| AI Providers | OpenAI, Anthropic, Google Gemini, OpenRouter, DeepSeek, HuggingFace, Ollama |
| Auto-Update | **Tauri updater** + GitHub Releases |
| CI/CD | **GitHub Actions** — build, test, release |
| Website | Static HTML/CSS/JS → **Vercel** |

## Plugin Architecture
```
┌─────────────────────────────────────────────────┐
│                  Tauri Window                    │
│  ┌───────────────────────────────────────────┐  │
│  │         React UI (Sidebar + Content)       │  │
│  │  ┌──────┐  ┌──────┐  ┌──────┐             │  │
│  │  │Plugin│  │Plugin│  │Plugin│             │  │
│  │  │Card 1│  │Card 2│  │Card 3│  ...        │  │
│  │  └──────┘  └──────┘  └──────┘             │  │
│  └───────────────────────────────────────────┘  │
│                      │ IPC                       │
│  ┌───────────────────────────────────────────┐  │
│  │       Rust Backend (Tauri Commands)        │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐ │  │
│  │  │ OCR      │  │ AI Chat  │  │ Updater  │ │  │
│  │  │ Engine   │  │ Engine   │  │          │ │  │
│  │  └──────────┘  └──────────┘  └──────────┘ │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## Development Phases

### Phase 1 — Foundation (Current)
- [x] Project scaffolding
- [ ] Rust + Tauri setup
- [ ] React + Tailwind + Vite
- [ ] Plugin system architecture
- [ ] Settings (theme, auto-update toggle)
- [ ] GitHub repo + branches + CI/CD

### Phase 2 — Core Plugins
- [ ] OCR Plugin (Tesseract default + PaddleOCR optional)
- [ ] AI Chat Plugin (Ollama + 6 cloud providers)
- [ ] Both with floating button/window support

### Phase 3 — Polish & Web
- [ ] Auto-update system
- [ ] Landing page on Vercel
- [ ] Documentation: custom plugin guide
- [ ] Community contribution guide

## Branch Strategy
- `main` — Latest stable release. Protected. PRs only from DEV.
- `DEV` — Active development. Feature branches merged here.
- Feature branches: `feat/<name>` → PR to DEV → PR to main on release.

## Release Strategy
- GitHub Actions builds for Windows (.msi/.exe)
- Automated release draft on version tag
- Tauri updater checks GitHub Releases metadata
