# Changelog

## [Unreleased] — Pterodactyl 1.14.1 audit

### Fixed

- Rebased the shipped frontend manifest and lockfile on the official Pterodactyl 1.14.1 dependency baseline.
- Added and pinned all theme imports: BBCode rendering, MD5, language detection, history, Redux peer support, React type packages, and `react-icons`.
- Removed the invalid/obsolete xterm search-bar and Unicode11 dependencies, plus the unused breakpoint and path-browserify packages.
- Replaced the incompatible xterm search-bar API with a native console search toolbar backed by `xterm-addon-search`.
- Pinned React DOM to the React 16.14-compatible hot-loader alias and aligned `@preact/signals-react`, `react-is`, and Redux peer dependencies.
- Corrected React Router v5 imports, preserving `StaticContext` from `react-router`.
- Updated i18next backend typing and browser language detection for the current installed i18next stack.
- Fixed TypeScript event, upload-progress, input inheritance, clone-element, translation, and component-name casing issues.
- Renamed the theme announcement component to avoid a Windows case-insensitive collision with Pterodactyl's `alert` directory.
- Made asset cleanup cross-platform and removed the Node 22 `DEP0180` webpack warning from the production scripts.
- Updated the installer to use the committed manifest/lockfile rather than floating package installs, with Yarn frozen-lockfile and npm fallbacks.
- Added package metadata and refreshed installation documentation for VantaHost branding and Void Development ownership.

### Verified

- Yarn 1.22.22 frozen install.
- Plain npm install without `--force`, `--legacy-peer-deps`, or manual package additions.
- TypeScript `tsc --noEmit`.
- Production webpack build against a clean merged Pterodactyl 1.14.1 tree.
- Removed v1.1 archive and stale incompatible imports/dependencies.

### Deployment note

The local audit environment is Windows and does not have PHP or Composer installed. The Laravel installer, migrations, route registration, and live browser console must be exercised on the target Ubuntu 24.04 Pterodactyl 1.14.1 server.