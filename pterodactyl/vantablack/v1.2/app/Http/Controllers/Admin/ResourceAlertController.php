<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Models\Server;
use Pterodactyl\Http\Controllers\Controller;

class ResourceAlertController extends Controller
{
    public function __construct(
        private AlertsMessageBag $alert,
    ) {
    }

    public function index(): View
    {
        $rules = [];
        $events = [];

        if (Schema::hasTable('resource_alert_rules')) {
            $rules = DB::table('resource_alert_rules')
                ->join('servers', 'resource_alert_rules.server_id', '=', 'servers.id')
                ->join('users', 'resource_alert_rules.user_id', '=', 'users.id')
                ->select('resource_alert_rules.*', 'servers.name as server_name', 'users.username as user_name')
                ->orderByDesc('resource_alert_rules.id')
                ->get();
        }

        if (Schema::hasTable('resource_alert_events')) {
            $events = DB::table('resource_alert_events')
                ->join('servers', 'resource_alert_events.server_id', '=', 'servers.id')
                ->select('resource_alert_events.*', 'servers.name as server_name')
                ->orderByDesc('resource_alert_events.triggered_at')
                ->limit(50)
                ->get();
        }

        $servers = Server::query()->orderBy('name')->get();

        return view('admin.alerts.index', [
            'rules' => $rules,
            'events' => $events,
            'servers' => $servers,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'server_id' => ['required', 'integer'],
            'metric' => ['required', 'string', 'in:cpu,memory,disk'],
            'threshold_percent' => ['required', 'integer', 'min:50', 'max:100'],
            'cooldown_minutes' => ['required', 'integer', 'min:5', 'max:1440'],
        ]);

        $server = Server::findOrFail($validated['server_id']);

        if (Schema::hasTable('resource_alert_rules')) {
            DB::table('resource_alert_rules')->insert([
                'server_id' => $server->id,
                'user_id' => $server->owner_id,
                'metric' => $validated['metric'],
                'threshold_percent' => $validated['threshold_percent'],
                'cooldown_minutes' => $validated['cooldown_minutes'],
                'notify_email' => $request->has('notify_email'),
                'notify_panel' => $request->has('notify_panel'),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $this->alert->success('Resource alert rule created successfully.')->flash();
        }

        return redirect()->route('admin.alerts');
    }

    public function destroy(int $id): RedirectResponse
    {
        if (Schema::hasTable('resource_alert_rules')) {
            DB::table('resource_alert_rules')->where('id', $id)->delete();
            $this->alert->success('Resource alert rule deleted.')->flash();
        }

        return redirect()->route('admin.alerts');
    }
}
