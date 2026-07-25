# VantaHost Vantablack Theme

Vantablack is the premium dark interface for VantaHost, built for the Pterodactyl panel. It is focused on a fast server workflow: a clear dashboard, live console access, polished navigation, and a powerful VantaHost Studio admin area.

VantaHost is built by Vantablack, a Void Development company.

## Highlights

- Always-visible live console module on every server dashboard.
- Dedicated full-screen console route with command history, search, copy-log, pop-out, and power controls.
- Permission-aware dashboard quick actions for files, backups, schedules, and activity.
- Console keyboard workflow: Ctrl/Cmd + F searches output and Ctrl/Cmd + L clears the terminal.
- VantaHost Studio responsive navigation with a Ctrl+K quick-jump command palette.
- Live dashboard iframe preview and one-click preview/support shortcuts for administrators.
- User command-center header with server totals, account controls, and direct console actions on every server card.
- Modern glass surfaces, responsive navigation, accessible focus states, and high-contrast status colors.
- VantaHost Studio controls for branding, metadata, layout, components, styling, colors, mail, announcements, advanced options, live preview, and status checks.
- Canonical VantaHost Discord support link: https://discord.gg/2vx6tCXmr4
- Only the current v1.2 theme archive is included.

## Requirements

- Pterodactyl panel compatible with this theme archive.
- PHP 8.3 or newer.
- Node.js 22 or newer.
- Yarn or npm.
- The installer automatically adds the theme-only frontend packages, including react-icons and xterm-addon-search-bar.

## Installation

1. Copy the contents of pterodactyl/ into the Pterodactyl panel root.
2. From the panel root, run:

   ~~~bash
   php artisan vantablack install
   ~~~

3. Select the available v1.2 archive when prompted.
4. Complete the database and asset build steps shown by the installer.
5. Run application commands as the web-server user where possible. If ownership needs repair, apply it before clearing or rebuilding caches:

   ~~~bash
   chown -R www-data:www-data /var/www/pterodactyl
   sudo -u www-data php artisan optimize:clear
   sudo -u www-data php artisan optimize
   ~~~

6. Open the admin panel and use VantaHost Studio to finish your branding and layout setup.

## Safe update notes

The legacy archive has been removed. Keep a panel backup before installing or updating, and do not regenerate Laravel caches as root when the panel runs as www-data; doing so can recreate root-owned cache files and cause permission errors.

## Support

For help, join the VantaHost Discord community:

https://discord.gg/2vx6tCXmr4

## Credits

VantaHost is powered by Vantablack and Pterodactyl, with Void Development as the parent company.
