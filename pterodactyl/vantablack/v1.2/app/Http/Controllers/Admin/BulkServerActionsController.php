<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Models\Server;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Services\Servers\SuspensionService;
use Pterodactyl\Services\Servers\ReinstallServerService;
use Pterodactyl\Services\Servers\ServerDeletionService;

class BulkServerActionsController extends Controller
{
    public function __construct(
        private SuspensionService $suspensionService,
        private ReinstallServerService $reinstallServerService,
        private ServerDeletionService $deletionService,
        private AlertsMessageBag $alert,
    ) {
    }

    public function process(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'server_ids' => ['required', 'array', 'min:1'],
            'server_ids.*' => ['integer', 'exists:servers,id'],
            'action' => ['required', 'string', 'in:suspend,unsuspend,reinstall,delete'],
        ]);

        $servers = Server::whereIn('id', $validated['server_ids'])->get();
        $action = $validated['action'];
        $count = 0;

        foreach ($servers as $server) {
            try {
                switch ($action) {
                    case 'suspend':
                        $this->suspensionService->toggle($server, SuspensionService::ACTION_SUSPEND);
                        $count++;
                        break;
                    case 'unsuspend':
                        $this->suspensionService->toggle($server, SuspensionService::ACTION_UNSUSPEND);
                        $count++;
                        break;
                    case 'reinstall':
                        $this->reinstallServerService->reinstall($server);
                        $count++;
                        break;
                    case 'delete':
                        $this->deletionService->handle($server);
                        $count++;
                        break;
                }
            } catch (\Throwable $e) {
                // Log failure for individual server while continuing bulk batch
                logger()->error("Bulk action {$action} failed for server #{$server->id}: {$e->getMessage()}");
            }
        }

        $this->alert->success("Bulk {$action} action executed on {$count} server(s).")->flash();

        return redirect()->route('admin.servers');
    }
}
