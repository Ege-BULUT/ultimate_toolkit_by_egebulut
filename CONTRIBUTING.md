# Contributing to Ultimate Toolkit

First off, thanks for taking the time to contribute! 🎉

## Code of Conduct

Be respectful, constructive, and inclusive. We're all here to build something awesome.

## How to Contribute

### 🐛 Report Bugs
1. Search [existing issues](https://github.com/egebulut/ultimate_toolkit_by_egebulut/issues) first
2. If not found, [create a new issue](https://github.com/egebulut/ultimate_toolkit_by_egebulut/issues/new)
3. Include: OS version, app version, steps to reproduce, expected vs actual behavior

### 💡 Suggest Features
1. Check [ROADMAP.md](./ROADMAP.md) for planned features
2. Open a [Discussion](https://github.com/egebulut/ultimate_toolkit_by_egebulut/discussions) or Feature Request issue
3. Explain the use case and how it would help

### 🔧 Submit Code

#### Branch Strategy
- `main` — Latest stable. DO NOT commit directly.
- `DEV` — Active development. PRs go here.
- `feat/<name>` — Feature branches → PR to DEV

#### Development Setup
```bash
git clone https://github.com/egebulut/ultimate_toolkit_by_egebulut.git
cd ultimate_toolkit_by_egebulut
git checkout DEV
npm install
npm run tauri:dev
```

#### Coding Standards
- **TypeScript**: Strict mode, no `any`, no `@ts-ignore`
- **Rust**: Clippy-clean, no `unwrap()`, typed errors
- **CSS**: Use CSS variables (see `globals.css`), Tailwind utilities
- **Components**: Add `Tooltip` wrappers for hover hints

#### PR Checklist
- [ ] Code follows existing style
- [ ] Added/updated docs if needed
- [ ] Tested locally (`npm run tauri:dev`)
- [ ] No new warnings/errors
- [ ] Commits are atomic and descriptive

### 🧩 Writing a Plugin

See the [Custom Plugin Guide](https://utoolkit.vercel.app/docs/custom-plugins) for detailed instructions.

Quick overview:
1. Create a new folder under `src/plugins/<your-plugin>/`
2. Extend `PluginBase` class
3. Add config component and optional floating UI
4. Register in `PluginRegistry`
5. For Rust backend: add Tauri commands in `src-tauri/src/plugins/`

### 🌐 Translation

Interested in translating? Open an issue with the language you want to contribute.

## Questions?

Open a [Discussion](https://github.com/egebulut/ultimate_toolkit_by_egebulut/discussions) or reach out via GitHub.
