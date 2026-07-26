# Fixed Pannel Test â€” VantaHost Vantablack

A production-ready VantaHost Vantablack theme overlay for Pterodactyl Panel 1.14.1.

Built for VantaHost by Vantablack. Parent company: Void Development.

## Compatibility

- Pterodactyl Panel 1.14.1
- Ubuntu 24.04
- PHP 8.3
- Laravel 11
- Node.js 22+
- Composer 2
- npm or Yarn 1.x
- MySQL/MariaDB supported by the upstream Pterodactyl release

This repository is an overlay. It must be applied to a clean Pterodactyl v1.14.1 panel; it is not a standalone replacement for the upstream panel.

## Features

- Premium responsive user dashboard and server command center.
- Live server console with native output search, command history, copy-log, pop-out, reconnect handling, and power controls.
- Enhanced server pages for files, backups, schedules, network, startup, activity, and authentication.
- VantaHost Studio admin controls for branding, metadata, layout, colors, styling, mail, announcements, components, live preview, and health status.
- Permission-aware routes and actions.
- VantaHost branding with Discord support at https://discord.gg/2vx6tCXmr4.
- Maintained v1.2 archive only. Legacy v1.1 is removed.

## Fresh installation

Start with a working, clean Pterodactyl Panel 1.14.1 installation.

    cd /var/www

    git clone https://github.com/mehraronak81-creator/fixed-pannel-test.git
    cp -a fixed-pannel-test/pterodactyl/. /var/www/pterodactyl

    cd /var/www/pterodactyl
    composer install --no-dev --optimize-autoloader
    npm install
    npm run build:production
    php artisan vantablack install
    php artisan optimize
    php artisan up

When the installer asks for a theme version, select v1.2.

The repository ships the compatible package.json and valid yarn.lock. The installer uses npm when package-lock.json exists, which matches the documented npm workflow. On Yarn-only deployments it uses Yarn with --frozen-lockfile. Do not run manual yarn add, npm install --force, or source edits.

## Applying to an existing panel

Back up the panel and database first, then put the panel into maintenance mode:

    cd /var/www/pterodactyl
    php artisan down

Clone the theme repository outside the panel and apply the overlay:

    cd /var/www
    git clone https://github.com/mehraronak81-creator/fixed-pannel-test.git
    cp -a fixed-pannel-test/pterodactyl/. /var/www/pterodactyl
    cd /var/www/pterodactyl

Reinstall dependencies and rebuild assets:

    composer install --no-dev --optimize-autoloader
    npm install
    npm run build:production
    php artisan vantablack install
    php artisan optimize
    php artisan up

The installer copies the theme files, registers the admin routes/controllers, runs migrations, installs frontend dependencies, builds assets, and clears/rebuilds Laravel caches.

## Permissions

Run panel commands as the same account that owns the panel files. On a standard Ubuntu deployment this is usually www-data:

    chown -R www-data:www-data /var/www/pterodactyl
    sudo -u www-data php artisan optimize:clear
    sudo -u www-data php artisan optimize

Do not rebuild Laravel caches as root and then serve the panel as www-data; that creates root-owned cache/log files and causes permission errors.

## Verification

The overlay was audited against official Pterodactyl v1.14.1 sources:

- Yarn frozen-lockfile installation.
- Plain npm installation without --force.
- TypeScript tsc --noEmit.
- Production webpack compilation.
- React Router, i18next, React Icons, xterm, and import compatibility checks.
- Admin route, controller, request, view, and asset checks.
- Removed v1.1 and obsolete dependency/import checks.

The Laravel installer and live browser UI must ultimately be tested on the target Ubuntu server because PHP, Composer, and a live Pterodactyl runtime are deployment requirements.

## Troubleshooting

Check the current panel root before installing:

    test -f /var/www/pterodactyl/artisan
    test -f /var/www/pterodactyl/package.json
    node --version
    php --version

If the panel shows stale assets after an update:

    cd /var/www/pterodactyl
    sudo -u www-data php artisan optimize:clear
    sudo -u www-data php artisan optimize

If the installer cannot find a theme version, confirm that /var/www/pterodactyl/vantablack/v1.2 exists and that the command is being run from the panel root.

## Support and credits

Discord: https://discord.gg/2vx6tCXmr4

VantaHost is powered by Vantablack and Pterodactyl, with Void Development as the parent company.