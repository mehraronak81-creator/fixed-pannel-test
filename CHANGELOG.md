# Changelog

## Unreleased - stale admin dashboard replacement

- Added the upstream Pterodactyl 1.14.1 admin dashboard view to both overlay stages. This replaces stale third-party dashboard files that call unregistered admin.bulk-actions, admin.health, admin.maintenance, or admin.trashbin routes.
- Rechecked every static Blade route reference after installation: all 66 resolve against the 114 registered named routes.

## Unreleased - complete upstream-overlay consistency audit

- Added pre-installer compatibility overlays for shared themed components, server settings, and Tailwind tokens, so strict TypeScript and Webpack checks succeed both before and after installation.
- Restored the upstream admin.users.delete route name in the themed admin route file.
- Added the maintenance Blade view referenced by the registered maintenance middleware.
- Audited the merged v1.14.1 panel: static named-route references, route controllers, controller and middleware views, source imports, npm lock metadata, and frozen Yarn resolution all resolve.

## Unreleased - reproducible npm and native console search

- Committed pterodactyl/package-lock.json and regenerated pterodactyl/yarn.lock from the audited manifest. The installer selects npm when the npm lockfile is present.
- Kept the React-based console search controls backed by xterm-addon-search; both pre-installer and theme Console.tsx files now contain no SearchBarAddon integration.
- Confirmed styled-components-breakpoint is not required: the theme uses its local styled-components breakpoint helper, and no source file imports the third-party package.

## Unreleased - clean Pterodactyl 1.14.1 installation audit

### Dependency and lockfile fixes

- Rebased the manifest on the Pterodactyl Panel 1.14.1 dependency baseline and regenerated the Yarn 1 lockfile.
- Added all direct theme imports to package.json: bbcode-to-react, md5, i18next browser language detection, history, React Icons, React Router, and their required type packages.
- Pinned React Router 5.3.4 to match React Router DOM v5 and support the direct StaticContext imports.
- Pinned React DOM to the React 16.14 hot-loader alias, @preact/signals-react 2.0.0, react-is 16.13.1, Redux 4.2.1, and tslib 2.8.1 to satisfy the installed peer graph without force flags.
- Pinned Tailwind CSS 3.0.24 and @tailwindcss/line-clamp 0.4.4. This matches the Pterodactyl 1.14 Tailwind and Twin.macro configuration and prevents the modern Tailwind line-clamp warning.
- Kept xterm 4.19.0 with xterm-addon-fit 0.5.0, xterm-addon-search 0.5.0, and xterm-addon-web-links 0.6.0.

### Removed or replaced incompatible integrations

- Removed xterm-addon-unicode11 because its published 0.6.0 peer dependency requires xterm 5.
- Removed xterm-addon-search-bar and replaced its incompatible API with native React search controls backed by xterm-addon-search.
- Removed styled-components-breakpoint and replaced it with a local styled-components breakpoint helper.
- Removed the obsolete path-browserify type package and the unnecessary runtime line-clamp configuration from the theme config.
- Replaced Windows-conflicting Alert.tsx theme naming with VantaAnnouncement.tsx.

### Build and installer fixes

- Added root compatibility overlays for the console, breakpoint helper, and Tailwind configuration. They are copied before the first npm build, so the documented command order works on a vanilla panel before the theme archive is installed.
- Restored the upstream Tailwind configuration for the pre-installer build and registered line-clamp in the v1.2 theme Tailwind configuration for the post-installer build.
- Updated the installer to use committed manifests instead of floating package installation commands.
- Updated the installer to use npm whenever package-lock.json exists, avoiding mixed npm/Yarn lockfile warnings in the documented npm workflow. Yarn-only installations still use frozen-lockfile mode.
- Added cross-platform asset cleanup and scoped Node 22 DEP0180 warning suppression.

### Application compatibility fixes

- Corrected React Router v5 imports, i18next backend typing and browser detection, React Icons compatibility, TypeScript event types, upload progress types, input inheritance, translation props, and clone-element typing.
- Restored admin.system-health.json and verified the VantaHost admin controllers and request classes exist.
- Verified there are no source imports of xterm-addon-search-bar, xterm-addon-unicode11, styled-components-breakpoint, or the removed line-clamp plugin in the theme source.

### Validation completed

- Plain npm install in a clean merged Pterodactyl 1.14.1 panel with no --force and no legacy-peer-deps.
- Pre-installer npm run build:production against vanilla Pterodactyl plus the copied overlay.
- Theme archive application followed by TypeScript tsc --noEmit.
- Post-installer npm run build:production against the full themed panel.
- Yarn 1.22.22 frozen-lockfile installation using the committed lockfile.

### Environment boundary

PHP, Composer, Laravel migrations, artisan route execution, and live browser smoke testing require an Ubuntu Pterodactyl runtime. The Windows audit workspace does not provide PHP or Composer, so those commands were statically reviewed but cannot be executed here.