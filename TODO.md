# Ultimate Toolkit — Master Plan

> Her şeyin takibi. Güncelle: `status` sütununu ilerledikçe değiştir.

---

## 🏗️ Build & Release Pipeline

| # | Task | Impact | Difficulty | Status | Depends On |
|---|------|--------|------------|--------|------------|
| 1 | `npm run tauri:build` çalışır durumda — MSI/NSIS üretimi | 🔴 Kritik | 🟡 Medium | ❌ Pending | Rust toolchain, deps |
| 2 | GitHub Actions CI — push'ta `cargo test + npm run tsc + npm run lint` | 🔴 Kritik | 🟢 Easy | ❌ Pending | #1 |
| 3 | GitHub Actions CD — tag push'unda `.msi` + `.exe` artifact yayınla | 🟠 High | 🟡 Medium | ❌ Pending | #1, #2 |
| 4 | Code signing certificate entegrasyonu (Windows SmartScreen) | 🟠 High | 🔴 Hard | ❌ Pending | #3 |
| 5 | Tauri updater JSON (`latest.yml`) Release'lerle otomatik güncelle | 🟡 Medium | 🟡 Medium | ❌ Pending | #3 |

---

## 🖥️ App UI / Navigation / Pages

| # | Task | Impact | Difficulty | Status | Depends On |
|---|------|--------|------------|--------|------------|
| 6 | **App shell** — sidebar + content area layout | 🔴 Kritik | 🟢 Easy | ✅ Done | — |
| 7 | **Ana navigasyon**: Plugin List, Settings sayfaları | 🔴 Kritik | 🟢 Easy | ✅ Done | #6 |
| 8 | **Plugin Manager page** — toggle on/off, config, floating button | 🔴 Kritik | 🟡 Medium | ✅ Done | #6, #16 |
| 9 | **Settings page** — theme, auto-update, about | 🟠 High | 🟢 Easy | ✅ Done | #6 |
| 10 | **Floating window sistemi** — drag/resize | 🟠 High | 🟡 Medium | ✅ Done | #6 |
| 11 | **Welcome / Onboarding** — ilk açılışta quick start ekranı | 🟢 Low | 🟢 Easy | ✅ Done | #6 |

---

## 🧩 Plugin Sistemi

| # | Task | Impact | Difficulty | Status | Depends On |
|---|------|--------|------------|--------|------------|
| 12 | `PluginBase` class — lifecycle (`onActivate`, `onDeactivate`) | 🔴 Kritik | 🟢 Easy | ✅ Done | — |
| 13 | `PluginRegistry` — singleton register/get/enable/disable/enabled | 🔴 Kritik | 🟢 Easy | ✅ Done | — |
| 14 | `PluginDefinition` interface — id, name, icon, version, author | 🔴 Kritik | 🟢 Easy | ✅ Done | — |
| 15 | Per-plugin config storage (`Storage.set/get` scoped) | 🟠 High | 🟢 Easy | ✅ Done | — |
| 16 | **Floating UI support** — custom button (56×56 circular, draggable, icon) | 🔴 Kritik | 🟡 Medium | ✅ Done | #10 |
| 17 | Plugin state persistence (enabled/disabled config) | 🟠 High | 🟢 Easy | ✅ Done | #12 |
| 18 | **Add Custom Plugin** UI — file picker + load from local dir | 🟠 High | 🟡 Medium | ❌ Pending | #12 |
| 19 | **Add Plugin from GitHub** — `git clone` + register from repo | 🟠 High | 🔴 Hard | ❌ Pending | #12, #44 |
| 20 | Plugin error boundary — tek plugin crash'i tüm app'i götürmesin | 🟠 High | 🟡 Medium | ✅ Done | #12 |
| 21 | Plugin hot-reload (dev mode) | 🟢 Low | 🔴 Hard | ❌ Pending | #12 |

---

## 🔍 OCR Plugini

| # | Task | Impact | Difficulty | Status | Depends On |
|---|------|--------|------------|--------|------------|
| 22 | OCR plugin **tanımı** (`PluginDefinition` + `PluginBase`) | 🔴 Kritik | 🟢 Easy | ✅ Done | — |
| 23 | **OCR Config sayfası** — language selector, engine switcher, test area | 🔴 Kritik | 🟡 Medium | ✅ Done | #6, #15 |
| 24 | **Tesseract backend** — `leptess` / `tesseract` CLI ile OCR çalıştırma | 🔴 Kritik | 🟡 Medium | ✅ Done | Rust setup |
| 25 | Screen capture entegrasyonu (region select via native API) | 🟠 High | 🔴 Hard | ❌ Pending | #10 |
| 26 | Clipboard paste & recognize | 🟠 High | 🟢 Easy | ✅ Done | #24 |
| 27 | OCR result panel — text display, copy, export | 🟠 High | 🟢 Easy | ✅ Done | #24 |
| 28 | Language manager — download/install tessdata dilleri | 🟡 Medium | 🟡 Medium | ✅ Done | #24 |
| 29 | Multi-engine support — Tesseract / PaddleOCR / TrOCR switcher | 🟡 Medium | 🔴 Hard | ❌ Pending | #24 |

---

## 🤖 AI Chat Plugini

| # | Task | Impact | Difficulty | Status | Depends On |
|---|------|--------|------------|--------|------------|
| 30 | AI Chat plugin **tanımı** (`PluginDefinition` + `PluginBase`) | 🔴 Kritik | 🟢 Easy | ✅ Done | — |
| 31 | **AI Chat Config sayfası** — provider seçimi, API key input, model selector | 🔴 Kritik | 🟡 Medium | ✅ Done | #6, #15 |
| 32 | **Provider API integrations** — OpenAI, Anthropic, Gemini, OpenRouter, DeepSeek, HuggingFace | 🔴 Kritik | 🟡 Medium | ✅ Done | — |
| 33 | **Ollama auto-detect** — local model detection | 🟠 High | 🟢 Easy | ✅ Done | — |
| 34 | **Floating chat window** — summon, conversation UI | 🟠 High | 🟡 Medium | ✅ Done | #10 |
| 35 | Conversation persistence (local history) | 🟡 Medium | 🟢 Easy | ✅ Done | #15 |
| 36 | System prompt editor | 🟡 Medium | 🟢 Easy | ✅ Done | #31 |
| 37 | Markdown rendering in chat output | 🟠 High | 🟢 Easy | ✅ Done | — |

---

## 📚 Web Docs (utoolkit.vercel.app)

| # | Task | Impact | Difficulty | Status | Depends On |
|---|------|--------|------------|--------|------------|
| 38 | Landing page — premium tasarım, dark/light toggle | 🔴 Kritik | 🟢 Easy | ✅ Done | — |
| 39 | Docs SPA — versioned router, sidebar, anchor links, breadcrumbs | 🔴 Kritik | 🟡 Medium | ✅ Done | — |
| 40 | Content: Getting Started (4 pages) | 🔴 Kritik | 🟢 Easy | ✅ Done | — |
| 41 | Content: OCR Plugin (3 pages) | 🔴 Kritik | 🟢 Easy | ✅ Done | — |
| 42 | Content: AI Chat (3 pages) | 🔴 Kritik | 🟢 Easy | ✅ Done | — |
| 43 | Content: Plugin System (3 pages) | 🔴 Kritik | 🟢 Easy | ✅ Done | — |
| 44 | Content: Development (3 pages) | 🟠 High | 🟢 Easy | ✅ Done | — |
| 45 | Content: Settings (3 pages) | 🟠 High | 🟢 Easy | ✅ Done | — |
| 46 | Vercel deploy + domain (`utoolkit.vercel.app`) | 🔴 Kritik | 🟢 Easy | ✅ Done | — |
| 47 | **Plugin SDK / API docs page** — full API reference for devs | 🟠 High | 🟡 Medium | ❌ Pending | #43 |
| 48 | **Search** in docs (client-side index) | 🟡 Medium | 🟡 Medium | ❌ Pending | #39 |

---

## 🧪 Plugin Template Branch

| # | Task | Impact | Difficulty | Status | Depends On |
|---|------|--------|------------|--------|------------|
| 49 | **`template/example-plugin` branch** — boilerplate plugin branch | 🟠 High | 🟢 Easy | ❌ Pending | #12 |
| 50 | Branch içeriği: `index.tsx`, `Config.tsx`, `FloatingComponent.tsx` | 🟠 High | 🟢 Easy | ❌ Pending | #49 |
| 51 | Branch README: "How to use this template to build your own plugin" | 🟡 Medium | 🟢 Easy | ❌ Pending | #49 |
| 52 | Branch CI: template'in bozulmadığını test eden workflow | 🟡 Medium | 🟡 Medium | ❌ Pending | #49 |

---

## 🔧 Rust Backend (src-tauri)

| # | Task | Impact | Difficulty | Status | Depends On |
|---|------|--------|------------|--------|------------|
| 53 | Tauri v2 commands scaffold (`invoke` handlers) | 🔴 Kritik | 🟢 Easy | ✅ Done | — |
| 54 | OCR command — `extract_text(image_path, language) -> Result<String>` | 🔴 Kritik | 🟡 Medium | ✅ Done | #24, #53 |
| 55 | Screen capture command (native Windows API) | 🟠 High | 🔴 Hard | ❌ Pending | #53 |
| 56 | GitHub API client — `list_repo_files`, `download_plugin` | 🟠 High | 🟡 Medium | ❌ Pending | #53 |
| 57 | Settings read/write (filesystem JSON + memory state) | 🟠 High | 🟢 Easy | ✅ Done | #53 |
| 58 | Auto-updater setup (Tauri updater plugin + tauri.conf.json) | 🟠 High | 🟡 Medium | ✅ Done | #53 |

---

## 🎨 Tema & Görsellik

| # | Task | Impact | Difficulty | Status | Depends On |
|---|------|--------|------------|--------|------------|
| 59 | **Dark/Light/System theme** — CSS variables + localStorage | 🔴 Kritik | 🟢 Easy | ✅ Done | — |
| 60 | **App theme toggle** — desktop uygulamasında da aynı sistem | 🔴 Kritik | 🟢 Easy | ✅ Done | #6 |
| 61 | Plugin floating button — yuvarlak, 56×56, plugin icon'u gösterir | 🟠 High | 🟢 Easy | ✅ Done | #16 |

---

## 📊 Özet

| Kategori | Done | Pending | Toplam |
|----------|------|---------|--------|
| Build & Release | 0 | 5 | 5 |
| App UI / Navigation | 5 | 1 | 6 |
| Plugin Sistemi | 6 | 3 | 9 |
| OCR Plugin | 6 | 2 | 8 |
| AI Chat Plugin | 6 | 2 | 8 |
| Web Docs | 8 | 2 | 10 |
| Plugin Template Branch | 0 | 4 | 4 |
| Rust Backend | 4 | 2 | 6 |
| Tema & Görsellik | 3 | 0 | 3 |
| **Toplam** | **38** | **21** | **59** |

| Zorluk | Adet |
|--------|------|
| 🟢 Easy | 32 |
| 🟡 Medium | 22 |
| 🔴 Hard | 5 |

### 🔥 Next Up (öncelikli)

1. **#1** `npm run tauri:build` — çalıştığını doğrula
2. **#2** GitHub Actions CI — push'ta test/build/lint
3. **#18** Add Custom Plugin UI — file picker + register
4. **#20** Plugin error boundary — crash isolation
5. **#37** Markdown rendering in chat output
6. **#35** Conversation persistence (localStorage)
7. **#47** Plugin SDK / API docs page (web docs)
8. **#25** Screen capture (native Windows region capture)
9. **#49** Plugin template branch
10. **#19** Add Plugin from GitHub
