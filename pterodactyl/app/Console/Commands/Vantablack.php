<?php

namespace Pterodactyl\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Console\Formatter\OutputFormatterStyle;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Artisan;
use Symfony\Component\Process\Process;

class Vantablack extends Command
{
    protected $signature = 'vantablack {action?}';
    protected $description = 'VantaHost theme commands for Pterodactyl.';

    public function handle()
    {
        $action = $this->argument('action');

        $title = new OutputFormatterStyle('#fff', null, ['bold']);
        $this->output->getFormatter()->setStyle('title', $title);

        $b = new OutputFormatterStyle(null, null, ['bold']);
        $this->output->getFormatter()->setStyle('b', $b);

        if ($action === null) {
            $this->line("
            <title>
            ██╗   ██╗ █████╗ ███╗   ██╗████████╗ █████╗ ██╗  ██╗ ██████╗ ███████╗████████╗
            ██║   ██║██╔══██╗████╗  ██║╚══██╔══╝██╔══██╗██║  ██║██╔═══██╗██╔════╝╚══██╔══╝
            ██║   ██║███████║██╔██╗ ██║   ██║   ███████║███████║██║   ██║███████╗   ██║
            ╚██╗ ██╔╝██╔══██║██║╚██╗██║   ██║   ██╔══██║██╔══██║██║   ██║╚════██║   ██║
             ╚████╔╝ ██║  ██║██║ ╚████║   ██║   ██║  ██║██║  ██║╚██████╔╝███████║   ██║
              ╚═══╝  ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝

            VantaHost Control Panel - Vantablack by Void Development</title>

           > php artisan vantablack (this window)
           > php artisan vantablack install
           > php artisan vantablack update
           > php artisan vantablack uninstall
            ");
        } elseif ($action === 'install') {
            $this->install();
        } elseif ($action === 'update') {
            $this->update();
        } elseif ($action === 'uninstall') {
            $this->uninstall();
        } else {
            $this->error("Invalid action. Supported actions: install, update, uninstall");
        }
    }

    public function installOrUpdate($isUpdate = false)
    {
        if ($isUpdate) {
            $this->info("This command skips frequently used files by addons during theme updating to avoid losing your addon customizations. If you still experience an error after updating please reinstall.");
        }

        $confirmation = $this->confirm("Are all the required dependencies installed from the readme file?", "yes");
        if (!$confirmation) {
            return;
        }

        $versions = File::directories('./vantablack');
        if (empty($versions)) {
            $this->error("No versions found in /vantablack directory.");
            return;
        }

        $version = basename($this->choice("Select a version:", $versions));
        $this->info("Installing Vantablack Theme $version...");

        // Copy theme files to the panel root using PHP instead of exec/rsync
        $sourcePath = base_path("vantablack/{$version}");
        if (!File::isDirectory($sourcePath)) {
            $this->error("Source directory vantablack/{$version} does not exist.");
            return;
        }

        $excludeFiles = $isUpdate
            ? ['routes.ts', 'getServer.ts', 'admin.blade.php', 'admin.php', 'ServerTransformer.php']
            : [];

        $this->copyDirectory($sourcePath, base_path(), $excludeFiles);

        // Create Vantablack controllers directory
        $directoryPath = app_path('Http/Controllers/Admin/Vantablack');
        File::makeDirectory($directoryPath, 0755, true, true);

        // Copy the locally included controllers
        $controllers = [
            'VantablackController',
            'VantablackAdvancedController',
            'VantablackAnnouncementController',
            'VantablackColorsController',
            'VantablackComponentsController',
            'VantablackLayoutController',
            'VantablackMailController',
            'VantablackMetaController',
            'VantablackStylingController',
        ];

        $controllersSourcePath = base_path("vantablack/{$version}/app/Http/Controllers/Admin/Vantablack");
        if (File::isDirectory($controllersSourcePath)) {
            foreach ($controllers as $controller) {
                $src = "{$controllersSourcePath}/{$controller}.php";
                $dest = "{$directoryPath}/{$controller}.php";
                if (File::exists($src)) {
                    File::copy($src, $dest);
                    $this->info("Copied controller: {$controller}.php");
                } else {
                    $this->warn("Controller not found in theme archive: {$controller}.php (may already be installed)");
                }
            }
        } else {
            $this->info("Controllers already present in the target directory — skipping controller copy.");
        }

        $this->info("Migrating database...");
        Artisan::call('migrate', ['--force' => true]);
        $this->info(Artisan::output());

        $this->info("Installing required packages...");
        $this->info("This can take a minute...");
        
        $packages = ['@types/md5', 'md5', 'react-icons', '@types/bbcode-to-react', 'bbcode-to-react', 'i18next-browser-languagedetector', 'history', 'react-router', 'xterm-addon-search-bar'];
        
        // Check if yarn is available, otherwise fallback to npm
        $hasYarn = (new Process(['yarn', '--version']))->run() === 0;

        if ($hasYarn) {
            if (!$this->runProcess(array_merge(['yarn', 'add'], $packages, ['--ignore-engines']))) {
                return;
            }
            $this->info("Building panel assets with yarn...");
            if (!$this->runProcess(['yarn', 'build:production'])) {
                return;
            }
        } else {
            if (!$this->runProcess(array_merge(['npm', 'install'], $packages, ['--legacy-peer-deps']))) {
                return;
            }
            $this->info("Building panel assets with npm...");
            if (!$this->runProcess(['npm', 'run', 'build:production'])) {
                return;
            }
        }

        $this->info('Optimize application...');
        Artisan::call('optimize:clear');
        $this->info(Artisan::output());
        Artisan::call('optimize');
        $this->info(Artisan::output());

        $message = $isUpdate ? '│    ──   Theme updated   ──   │' : '│    ──   Theme installed   ──   │';
        $this->line("
            ╭───────────────────────────────╮
            │                               │
            $message
            │    ╰─╴   successfully   ╶─╯   │
            │                               │
            ╰───────────────────────────────╯

            Note: You may need to set file permissions manually:
            chown -R www-data:www-data " . base_path() . "/*
        ");
    }

    public function install()
    {
        $this->installOrUpdate();
    }

    public function update()
    {
        $this->installOrUpdate(true);
    }

    private function uninstall()
    {
        $this->line("To uninstall the Vantablack theme, re-download the official Pterodactyl panel release:");
        $this->line("  1. Put the panel in maintenance mode: php artisan down");
        $this->line("  2. Download the latest panel release from https://github.com/pterodactyl/panel/releases");
        $this->line("  3. Extract it over your current installation");
        $this->line("  4. Run: composer install --no-dev --optimize-autoloader");
        $this->line("  5. Run: php artisan view:clear && php artisan config:clear");
        $this->line("  6. Run: php artisan migrate --seed --force");
        $this->line("  7. Set permissions: chown -R www-data:www-data " . base_path() . "/*");
        $this->line("  8. Run: php artisan queue:restart && php artisan up");
    }

    /**
     * Run a process safely using Symfony Process component.
     */
    private function runProcess(array $command): bool
    {
        $process = new Process($command, base_path());
        $process->setTimeout(600);
        $process->run(function ($type, $buffer) {
            $this->output->write($buffer);
        });

        if (!$process->isSuccessful()) {
            $this->error("Command failed: " . implode(' ', $command));
            $this->error($process->getErrorOutput());
            return false;
        }

        return true;
    }

    /**
     * Recursively copy a directory, optionally excluding specific filenames.
     */
    private function copyDirectory(string $source, string $destination, array $excludeFiles = []): void
    {
        $files = File::allFiles($source);
        $directories = File::directories($source);

        // Create all subdirectories first
        foreach (File::directories($source) as $dir) {
            $relativePath = str_replace($source, '', $dir);
            File::makeDirectory($destination . $relativePath, 0755, true, true);
        }

        // Recursively ensure all nested directories exist
        foreach ($files as $file) {
            $basename = $file->getFilename();

            if (in_array($basename, $excludeFiles)) {
                continue;
            }

            $relativePath = $file->getRelativePath();
            $targetDir = $destination . '/' . $relativePath;
            File::makeDirectory($targetDir, 0755, true, true);

            $targetFile = $targetDir . '/' . $basename;
            File::copy($file->getPathname(), $targetFile);
        }
    }
}
