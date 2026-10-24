<?php

namespace Pterodactyl\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
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

        $this->registerClientRoutes();

        $this->info('Running database migrations...');
        try {
            $migrationExitCode = Artisan::call('migrate', ['--force' => true]);
            $output = Artisan::output();
            $this->output->write($output);
        } catch (\Throwable $e) {
            $output = $e->getMessage();
            $this->error($output);
            $migrationExitCode = self::FAILURE;
        }

        // If migration failed because a table/view already exists (common on existing panels with addons like server_orders)
        if ($migrationExitCode !== self::SUCCESS) {
            $maxRetries = 5;
            while ($migrationExitCode !== self::SUCCESS && $maxRetries > 0) {
                if (preg_match("/Table ['\"]?([^'\" ]+)['\"]? already exists/i", $output, $matches)) {
                    $tableName = $matches[1];
                    $this->warn("Table '{$tableName}' already exists in database. Reconciling migration state...");

                    $migrationFiles = File::glob(database_path('migrations/*.php'));
                    $reconciled = false;
                    $currentBatch = (DB::table('migrations')->max('batch') ?? 0) + 1;

                    foreach ($migrationFiles as $file) {
                        $content = File::get($file);
                        if (preg_match("/create\s*\(\s*['\"]" . preg_quote($tableName, '/') . "['\"]/i", $content)) {
                            $migrationName = pathinfo($file, PATHINFO_FILENAME);
                            DB::table('migrations')->insertOrIgnore([
                                'migration' => $migrationName,
                                'batch' => $currentBatch,
                            ]);
                            $this->info("Reconciled existing migration: {$migrationName}");
                            $reconciled = true;
                            break;
                        }
                    }

                    if ($reconciled) {
                        $this->info('Retrying database migrations...');
                        try {
                            $migrationExitCode = Artisan::call('migrate', ['--force' => true]);
                            $output = Artisan::output();
                            $this->output->write($output);
                        } catch (\Throwable $e) {
                            $output = $e->getMessage();
                            $this->error($output);
                            $migrationExitCode = self::FAILURE;
                        }
                        $maxRetries--;
                        continue;
                    }
                }
                break;
            }
        }

        if ($migrationExitCode !== self::SUCCESS) {
            $this->error('Database migrations failed. The VantaHost install was stopped before assets or caches were changed.');

            return self::FAILURE;
        }

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
        $clearExitCode = Artisan::call('optimize:clear');
        $this->output->write(Artisan::output());
        if ($clearExitCode !== self::SUCCESS) {
            return self::FAILURE;
        }

        $optimizeExitCode = Artisan::call('optimize');
        $this->output->write(Artisan::output());
        if ($optimizeExitCode !== self::SUCCESS) {
            return self::FAILURE;
        }

        $this->info($isUpdate ? 'VantaHost theme updated successfully.' : 'VantaHost theme installed successfully.');

        return self::SUCCESS;
    }

    /**
     * Idempotently wire the theme's extra client API routes into the base
     * routes/api-client.php so features like the file recycle-bin recorder work.
     */
    private function registerClientRoutes(): void
    {
        $base = base_path('routes/api-client.php');
        $overlay = base_path('routes/api-client-vantablack.php');

        if (!File::exists($base) || !File::exists($overlay)) {
            return;
        }

        $contents = File::get($base);
        if (str_contains($contents, 'api-client-vantablack.php')) {
            return; // Already registered.
        }

        $snippet = PHP_EOL . "// VantaHost theme client routes (auto-registered by 'php artisan vantablack install')."
            . PHP_EOL . "require __DIR__ . '/api-client-vantablack.php';" . PHP_EOL;

        File::append($base, $snippet);
        $this->info('Registered VantaHost client API routes in routes/api-client.php.');
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