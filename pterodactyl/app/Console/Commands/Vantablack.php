<?php

namespace Pterodactyl\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Symfony\Component\Process\Process;

class Vantablack extends Command
{
    protected $signature = 'vantablack {action?}';

    protected $description = 'VantaHost theme commands for Pterodactyl.';

    public function handle()
    {
        return match ($this->argument('action')) {
            null => $this->showHelp(),
            'install' => $this->installOrUpdate(),
            'update' => $this->installOrUpdate(true),
            'uninstall' => $this->uninstall(),
            default => $this->invalidAction(),
        };
    }

    private function showHelp(): int
    {
        $this->line('VantaHost Control Panel - Vantablack by Void Development');
        $this->line('php artisan vantablack install');
        $this->line('php artisan vantablack update');
        $this->line('php artisan vantablack uninstall');

        return self::SUCCESS;
    }

    private function invalidAction(): int
    {
        $this->error('Invalid action. Supported actions: install, update, uninstall.');

        return self::FAILURE;
    }

    private function installOrUpdate(bool $isUpdate = false): int
    {
        if (!$this->confirm('Install or update VantaHost on this Pterodactyl panel?', true)) {
            return self::SUCCESS;
        }

        $versions = array_map('basename', File::directories(base_path('vantablack')));

        if (empty($versions)) {
            $this->error('No theme versions were found in the vantablack directory.');

            return self::FAILURE;
        }

        $version = $this->choice('Select a version:', $versions);
        $sourcePath = base_path("vantablack/{$version}");

        if (!File::isDirectory($sourcePath)) {
            $this->error("Theme source directory does not exist: vantablack/{$version}");

            return self::FAILURE;
        }

        if (!File::exists(base_path('package.json'))) {
            $this->error('Pterodactyl package.json is missing. Run this command from a Pterodactyl 1.14.1 panel root.');

            return self::FAILURE;
        }

        $this->info(($isUpdate ? 'Updating' : 'Installing') . " VantaHost theme {$version}...");
        $excludedFiles = $isUpdate
            ? ['routes.ts', 'getServer.ts', 'admin.blade.php', 'admin.php', 'ServerTransformer.php']
            : [];

        $this->copyDirectory($sourcePath, base_path(), $excludedFiles);

        $this->info('Running database migrations...');
        Artisan::call('migrate', ['--force' => true]);
        $this->output->write(Artisan::output());

        $this->info('Installing frontend dependencies from the committed manifest...');
        $hasPackageLock = File::exists(base_path('package-lock.json'));
        $hasYarn = !$hasPackageLock && (new Process(['yarn', '--version']))->run() === 0;

        if ($hasYarn) {
            if (!$this->runProcess(['yarn', 'install', '--frozen-lockfile', '--non-interactive'])) {
                return self::FAILURE;
            }

            if (!$this->runProcess(['yarn', 'run', 'build:production'])) {
                return self::FAILURE;
            }
        } else {
            if ($hasPackageLock) {
                $this->info('package-lock.json detected; using npm to keep the dependency graph consistent.');
            }

            if (!$this->runProcess(['npm', 'install', '--no-audit', '--no-fund'])) {
                return self::FAILURE;
            }

            if (!$this->runProcess(['npm', 'run', 'build:production'])) {
                return self::FAILURE;
            }
        }

        $this->info('Optimizing the application...');
        Artisan::call('optimize:clear');
        $this->output->write(Artisan::output());
        Artisan::call('optimize');
        $this->output->write(Artisan::output());

        $this->info($isUpdate ? 'VantaHost theme updated successfully.' : 'VantaHost theme installed successfully.');

        return self::SUCCESS;
    }

    private function uninstall(): int
    {
        $this->line('To uninstall, restore a clean Pterodactyl release over this panel and rebuild dependencies.');

        return self::SUCCESS;
    }

    private function runProcess(array $command): bool
    {
        $process = new Process($command, base_path());
        $process->setTimeout(600);
        $process->run(function ($type, $buffer) {
            $this->output->write($buffer);
        });

        if ($process->isSuccessful()) {
            return true;
        }

        $this->error('Command failed: ' . implode(' ', $command));
        $this->error($process->getErrorOutput());

        return false;
    }

    private function copyDirectory(string $source, string $destination, array $excludedFiles = []): void
    {
        foreach (File::allFiles($source) as $file) {
            if (in_array($file->getFilename(), $excludedFiles, true)) {
                continue;
            }

            $targetDirectory = $destination . DIRECTORY_SEPARATOR . $file->getRelativePath();
            File::ensureDirectoryExists($targetDirectory, 0755, true);

            File::copy($file->getPathname(), $targetDirectory . DIRECTORY_SEPARATOR . $file->getFilename());
        }
    }
}