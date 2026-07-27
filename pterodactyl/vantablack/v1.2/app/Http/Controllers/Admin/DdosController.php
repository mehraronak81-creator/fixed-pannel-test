<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\View\View;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Models\Node;
use Pterodactyl\Models\Server;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class DdosController extends Controller
{
    public function __construct(
        private SettingsRepositoryInterface $settings,
        private AlertsMessageBag $alert,
    ) {
    }

    public function index(): View
    {
        $nodes = Node::query()->withCount('servers')->orderBy('name')->get();
        $providerName = $this->settings->get('settings::vantahost:ddos_provider', 'Generic Upstream Webhook / Edge Scrubbing');
        $apiEndpoint = $this->settings->get('settings::vantahost:ddos_api_endpoint', '');
        $apiKey = $this->settings->get('settings::vantahost:ddos_api_key', '');
        $webhookSecret = $this->settings->get('settings::vantahost:ddos_webhook_secret', '');
        $mitigationMode = $this->settings->get('settings::vantahost:ddos_mode', 'auto');
        $edgeIp = $this->settings->get('settings::vantahost:ddos_edge_ip', '');

        $events = [];
        if (Schema::hasTable('ddos_events')) {
            $events = DB::table('ddos_events')
                ->orderByDesc('detected_at')
                ->limit(50)
                ->get();
        }

        return view('admin.ddos.index', [
            'nodes' => $nodes,
            'providerName' => $providerName,
            'apiEndpoint' => $apiEndpoint,
            'apiKey' => $apiKey,
            'webhookSecret' => $webhookSecret,
            'mitigationMode' => $mitigationMode,
            'edgeIp' => $edgeIp,
            'events' => $events,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'provider_name' => ['required', 'string', 'max:255'],
            'api_endpoint' => ['nullable', 'string', 'url', 'max:500'],
            'api_key' => ['nullable', 'string', 'max:500'],
            'webhook_secret' => ['nullable', 'string', 'max:255'],
            'mitigation_mode' => ['required', 'string', 'in:auto,always_on,disabled'],
            'edge_ip' => ['nullable', 'string', 'max:255'],
        ]);

        foreach ($validated as $key => $value) {
            $this->settings->set("settings::vantahost:ddos_{$key}", (string) ($value ?? ''));
        }

        $this->alert->success('DDoS Protection Center configuration saved successfully.')->flash();

        return redirect()->route('admin.ddos');
    }

    public function toggleNode(Request $request, int $id): JsonResponse
    {
        $node = Node::findOrFail($id);
        $enabled = $request->input('enabled', true);

        // Store per-node DDoS mitigation state
        $this->settings->set("settings::vantahost:ddos_node_{$node->id}_enabled", $enabled ? '1' : '0');

        return response()->json([
            'success' => true,
            'node_id' => $node->id,
            'enabled' => $enabled,
            'message' => "Edge DDoS mitigation status updated for node {$node->name}.",
        ]);
    }
}
