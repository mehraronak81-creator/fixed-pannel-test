<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Throwable;
use Illuminate\Support\Arr;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Models\Node;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;
use Pterodactyl\Repositories\Wings\DaemonConfigurationRepository;
use Pterodactyl\Http\Requests\Admin\StoreHealthSettingsRequest;

class HealthController extends Controller
{
    public function __construct(
        private DaemonConfigurationRepository $daemon,
        private SettingsRepositoryInterface $settings,
        private AlertsMessageBag $alert,
    ) {
    }

    public function index(): View
    {
        return view('admin.health.index', [
            'nodes' => $this->nodes(),
            'thresholds' => $this->thresholds(),
        ]);
    }

    public function status(): JsonResponse
    {
        $thresholds = $this->thresholds();
        $nodes = $this->nodes()->map(function (Node $node) use ($thresholds) {
            $startedAt = microtime(true);

            try {
                $information = $this->daemon->setNode($node)->getSystemInformation(2);
                $latency = (int) round((microtime(true) - $startedAt) * 1000);
                $memoryAllocation = $this->percentage((float) ($node->servers_sum_memory ?? 0), (float) $node->memory);
                $diskAllocation = $this->percentage((float) ($node->servers_sum_disk ?? 0), (float) $node->disk);
                $cpuUsage = $this->number($information, ['metrics.cpu_percent', 'resources.cpu_percent', 'system.cpu_percent']);
                $memoryUsed = $this->number($information, ['metrics.memory_used_bytes', 'resources.memory_used_bytes', 'system.memory_used_bytes']);
                $memoryTotal = $this->number($information, ['metrics.memory_total_bytes', 'resources.memory_total_bytes', 'system.memory_bytes', 'memory_bytes']);
                $diskUsed = $this->number($information, ['metrics.disk_used_bytes', 'resources.disk_used_bytes', 'system.disk_used_bytes']);
                $diskTotal = $this->number($information, ['metrics.disk_total_bytes', 'resources.disk_total_bytes', 'system.disk_total_bytes']);
                $liveMemoryPercent = $memoryUsed !== null && $memoryTotal ? $this->percentage($memoryUsed, $memoryTotal) : null;
                $liveDiskPercent = $diskUsed !== null && $diskTotal ? $this->percentage($diskUsed, $diskTotal) : null;

                $severity = 'healthy';
                if ($node->maintenance_mode) {
                    $severity = 'maintenance';
                } elseif (
                    $memoryAllocation >= $thresholds['memory_warning']
                    || $diskAllocation >= $thresholds['disk_warning']
                    || ($cpuUsage !== null && $cpuUsage >= $thresholds['cpu_warning'])
                    || $latency >= $thresholds['latency_warning']
                ) {
                    $severity = 'warning';
                }

                return [
                    'id' => $node->id,
                    'online' => true,
                    'severity' => $severity,
                    'latency_ms' => $latency,
                    'version' => (string) Arr::get($information, 'version', ''),
                    'system' => [
                        'os' => (string) (Arr::get($information, 'system.os') ?? Arr::get($information, 'os', 'Unknown')),
                        'architecture' => (string) (Arr::get($information, 'system.architecture') ?? Arr::get($information, 'architecture', '')),
                        'cpu_threads' => (int) (Arr::get($information, 'system.cpu_threads') ?? Arr::get($information, 'cpu_count', 0)),
                        'uptime_seconds' => (int) ($this->number($information, ['metrics.uptime_seconds', 'system.uptime_seconds', 'uptime']) ?? 0),
                    ],
                    'docker' => [
                        'running' => (int) Arr::get($information, 'docker.containers.running', 0),
                        'total' => (int) Arr::get($information, 'docker.containers.total', 0),
                    ],
                    'allocation' => [
                        'memory_percent' => $memoryAllocation,
                        'disk_percent' => $diskAllocation,
                    ],
                    'live' => [
                        'cpu_percent' => $cpuUsage,
                        'memory_percent' => $liveMemoryPercent,
                        'disk_percent' => $liveDiskPercent,
                    ],
                ];
            } catch (Throwable) {
                return [
                    'id' => $node->id,
                    'online' => false,
                    'severity' => 'critical',
                    'latency_ms' => null,
                    'version' => null,
                    'system' => null,
                    'docker' => null,
                    'allocation' => [
                        'memory_percent' => $this->percentage((float) ($node->servers_sum_memory ?? 0), (float) $node->memory),
                        'disk_percent' => $this->percentage((float) ($node->servers_sum_disk ?? 0), (float) $node->disk),
                    ],
                    'live' => null,
                ];
            }
        })->values();

        return new JsonResponse([
            'generated_at' => now()->toIso8601String(),
            'thresholds' => $thresholds,
            'nodes' => $nodes,
        ]);
    }

    public function store(StoreHealthSettingsRequest $request): RedirectResponse
    {
        foreach ($request->validated() as $key => $value) {
            $this->settings->set("settings::vantahost:health_{$key}", (string) $value);
        }

        $this->alert->success('Node health thresholds have been updated.')->flash();

        return redirect()->route('admin.health');
    }

    private function nodes()
    {
        return Node::query()
            ->with('location')
            ->withCount('servers')
            ->withSum('servers', 'memory')
            ->withSum('servers', 'disk')
            ->orderBy('name')
            ->get();
    }

    /**
     * @return array{cpu_warning: int, memory_warning: int, disk_warning: int, latency_warning: int, refresh_seconds: int}
     */
    private function thresholds(): array
    {
        return [
            'cpu_warning' => (int) $this->settings->get('settings::vantahost:health_cpu_warning', 85),
            'memory_warning' => (int) $this->settings->get('settings::vantahost:health_memory_warning', 85),
            'disk_warning' => (int) $this->settings->get('settings::vantahost:health_disk_warning', 90),
            'latency_warning' => (int) $this->settings->get('settings::vantahost:health_latency_warning', 1000),
            'refresh_seconds' => (int) $this->settings->get('settings::vantahost:health_refresh_seconds', 30),
        ];
    }

    private function percentage(float $used, float $total): float
    {
        return $total > 0 ? round(min(100, max(0, ($used / $total) * 100)), 1) : 0.0;
    }

    /**
     * @param string[] $paths
     */
    private function number(array $information, array $paths): ?float
    {
        foreach ($paths as $path) {
            $value = Arr::get($information, $path);
            if (is_numeric($value)) {
                return (float) $value;
            }
        }

        return null;
    }
}