# VantaHost Vantablack Theme

VantaHost Vantablack is a production-oriented dark interface overlay for Pterodactyl Panel 1.14.1. It is built for VantaHost by Vantablack, a Void Development company.

## What is included

- A polished user command center with responsive server cards, quick actions, activity, status surfaces, and direct console access.
- A full console workflow with command history, copy-log, pop-out support, keyboard shortcuts, native terminal search, power controls, and reconnect-safe layout handling.
- VantaHost Studio administration for branding, metadata, layout, components, colors, styling, mail, announcements, live preview, and health/status checks.
- Permission-aware routes and actions for files, backups, schedules, network, startup, and server activity.
- VantaHost branding and the official support community: https://discord.gg/2vx6tCXmr4
- Only the maintained v1.2 archive. The legacy v1.1 archive has been removed.

## Compatibility

This release targets a vanilla Pterodactyl Panel v1.14.1 installation:

- Ubuntu 24.04
- PHP 8.3
- Laravel 11
- Node.js 22 or newer
- npm or Yarn 1.x
- Composer 2

The repository contains an overlay under `pterodactyl/`; it is not a replacement for the upstream panel source. Start with a clean Pterodactyl v1.14.1 panel and copy the overlay into it.

## Fresh installation

```bash
git clone https://github.com/mehraronak81-creator/vantahost-vantablack-theme.git
cp -a vantahost-vantablack-theme/pterodactyl/. /var/www/pterodactyl
cd /var/www/pterodactyl
composer install --no-dev --optimize-autoloader
npm install
npm run build:production
php artisan vantablack install
php artisan optimize
php artisan up
```

The repository ships the Pterodactyl 1.14.1-compatible `package.json` and a valid `yarn.lock`. The installer uses those manifests and runs a frozen Yarn install when Yarn is available, or a normal npm install otherwise. No manual package installation, `--force`, or source edits are required.

Run the installer from the panel root. It verifies that the target is a Pterodactyl 1.14.1-style panel, installs the selected v1.2 archive, runs migrations, installs frontend dependencies, and builds production assets.

For production deployments, keep the panel files owned by the web-server account and run Laravel cache commands as that account. This prevents root-owned cache and log files from causing permission failures.

## Verification

The merged overlay was verified against the official Pterodactyl v1.14.1 source with:

- frozen Yarn install using Yarn 1.22.22;
- plain `npm install` with no `--force` or legacy peer override;
- TypeScript `tsc --noEmit`;
- production webpack build;
- stale import/dependency scans for the removed xterm search-bar, Unicode, router, and breakpoint APIs.

PHP/Composer and a live browser/server are deployment-time requirements; the Windows audit environment cannot execute `php artisan` or a live Ubuntu Pterodactyl panel.

## Support and credits

Join the VantaHost Discord community at https://discord.gg/2vx6tCXmr4.

VantaHost is powered by Vantablack and Pterodactyl, with Void Development as the parent company.