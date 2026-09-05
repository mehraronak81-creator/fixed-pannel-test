<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Models\Server;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

/**
 * Manages per-server network bandwidth caps and the panel-wide default cap.
 *
 * The panel only stores policy here; actual traffic shaping is applied on each
 * node host by the companion script (scripts/vantablack-bandwidth.sh) which
 * pulls this policy from the /admin/bandwidth/policy.json endpoint and programs
 * Linux `tc` (HTB) rules against each server's docker interface.
 */
class BandwidthController extends Controller
{
    private const DEFAULT_KEY = 'settings::vantahost:bandwidth_default_mbps';
    private const ENABLED_KEY = 'settings::vantahost:bandwidth_enabled';

    public function __construct(
        private AlertsMessageBag $alert,
        private SettingsRepositoryInterface $settings,
    ) {
    }

    public function index(): View
    {
        $limits = collect();
        $enabledMap = collect();
        if (Schema::hasTable('server_bandwidth_limits')) {
            $limits = DB::table('server_bandwidth_limits')->pluck('rate_mbps', 'server_id');
            $enabledMap = DB::table('server_bandwidth_limits')->pluck('enabled', 'server_id');
        }

        $servers = Server::query()
            ->with('node')
            ->orderBy('name')
            ->paginate(50);

        return view('admin.bandwidth.index', [
            'servers' => $servers,
            'limits' => $limits,
            'enabledMap' => $enabledMap,
            'defaultMbps' => (int) $this->settings->get(self::DEFAULT_KEY, 100),
            'globalEnabled' => (bool) $this->settings->get(self::ENABLED_KEY, true),
        ]);
    }

    /**
     * Save the panel-wide default cap that applies to every server which does
     * not have an explicit override.
     */
    public function updateDefault(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'default_mbps' => ['required', 'integer', 'min:1', 'max:100000'],
            'enabled' => ['nullable', 'boolean'],
        ]);

        $this->settings->set(self::DEFAULT_KEY, (string) $validated['default_mbps']);
        $this->settings->set(self::ENABLED_KEY, $request->has('enabled') ? '1' : '0');

        $this->alert->success('Default bandwidth policy updated. It applies to every server without an override.')->flash();

        return redirect()->route('admin.bandwidth');
    }

    /**
     * Set (or clear) a per-server override.
     *  - mode=default  -> remove the override, server follows the global default
     *  - mode=unlimited-> explicitly remove the cap for this server
     *  - mode=custom   -> apply a custom rate in mbps
     */
    public function updateServer(Request $request, int $serverId): RedirectResponse
    {
        if (!Schema::hasTable('server_bandwidth_limits')) {
            $this->alert->danger('Bandwidth table missing. Run database migrations first.')->flash();
            return redirect()->route('admin.bandwidth');
        }

        $validated = $request->validate([
            'mode' => ['required', 'in:default,unlimited,custom'],
            'rate_mbps' => ['nullable', 'integer', 'min:1', 'max:100000'],
        ]);

        $server = Server::query()->findOrFail($serverId);

        if ($validated['mode'] === 'default') {
            DB::table('server_bandwidth_limits')->where('server_id', $serverId)->delete();
            $this->alert->success("{$server->name} now follows the global default bandwidth policy.")->flash();
        } elseif ($validated['mode'] === 'unlimited') {
            $this->upsertServer($serverId, null, false);
            $this->alert->success("Bandwidth limiter removed for {$server->name} (unlimited).")->flash();
        } else {
            $rate = (int) ($validated['rate_mbps'] ?? 0);
            if ($rate < 1) {
                $this->alert->danger('Please provide a custom rate of at least 1 Mbit/s.')->flash();
                return redirect()->route('admin.bandwidth');
            }
            $this->upsertServer($serverId, $rate, true);
            $this->alert->success("{$server->name} bandwidth capped at {$rate} Mbit/s.")->flash();
        }

        return redirect()->route('admin.bandwidth');
    }

    /**
     * Machine-readable policy consumed by the node host shaping script.
     *
     * Returns the effective cap for every server: an explicit override when one
     * exists, otherwise the global default (or unlimited when the limiter is
     * globally disabled or a server is explicitly unlimited).
     */
    public function policy(): JsonResponse
    {
        $default = (int) $this->settings->get(self::DEFAULT_KEY, 100);
        $globalEnabled = (bool) $this->settings->get(self::ENABLED_KEY, true);

        $overrides = collect();
        if (Schema::hasTable('server_bandwidth_limits')) {
            $overrides = DB::table('server_bandwidth_limits')->get()->keyBy('server_id');
        }

        $servers = Server::query()->with('node')->get()->map(function (Server $server) use ($default, $globalEnabled, $overrides) {
            $override = $overrides->get($server->id);
            $rate = $default;
            $unlimited = !$globalEnabled;

            if ($override) {
                if (!$override->enabled || $override->rate_mbps === null) {
                    $unlimited = true;
                } else {
                    $rate = (int) $override->rate_mbps;
                    $unlimited = false;
                }
            }

            return [
                'server_id' => $server->id,
                'uuid' => $server->uuid,
                'node_id' => $server->node_id,
                'node_fqdn' => $server->node?->fqdn,
                'rate_mbps' => $unlimited ? null : $rate,
                'unlimited' => $unlimited,
            ];
        })->values();

        return new JsonResponse([
            'generated_at' => now()->toIso8601String(),
            'global_enabled' => $globalEnabled,
            'default_mbps' => $default,
            'servers' => $servers,
        ]);
    }

    private function upsertServer(int $serverId, ?int $rate, bool $enabled): void
    {
        DB::table('server_bandwidth_limits')->updateOrInsert(
            ['server_id' => $serverId],
            ['rate_mbps' => $rate, 'enabled' => $enabled, 'updated_at' => now(), 'created_at' => now()],
        );
    }
}
