# Contributing

## Getting Started

1. Fork the repository
2. Create a feature branch from `DEV`
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## Code Style

- TypeScript with strict mode
- Follow existing patterns in the codebase

## Testing

We use Vitest for frontend tests. Run all tests with `npm test` (182+ tests, 22 files).

For Rust tests: `cd src-tauri && cargo test` (requires Rust toolchain).

## Release Process

Releases are automated via GitHub Actions:

1. Changes are merged to `main` via a PR from `DEV`
2. A maintainer pushes a `v*` tag (e.g., `v1.0.1`)
3. The Release workflow builds the app (frontend + Rust)
4. The NSIS installer is uploaded to GitHub Releases
5. The Vercel site's download button automatically points to the latest release

## Pull Request Process

1. Update documentation if needed
2. Ensure CI passes (TypeScript check + 182 tests + cargo check + clippy)
3. Request review from maintainers