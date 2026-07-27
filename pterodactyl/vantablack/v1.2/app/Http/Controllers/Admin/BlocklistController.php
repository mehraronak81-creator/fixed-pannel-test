<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;

class BlocklistController extends Controller
{
    public function __construct(
        private AlertsMessageBag $alert,
    ) {
    }

    public function index(): View
    {
        $entries = [];
        if (Schema::hasTable('security_blocklist')) {
            $entries = DB::table('security_blocklist')
                ->orderByDesc('id')
                ->get();
        }

        return view('admin.security.blocklist', [
            'entries' => $entries,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ip_address' => ['nullable', 'string', 'max:100'],
            'cidr_subnet' => ['nullable', 'string', 'max:100'],
            'reason' => ['required', 'string', 'max:255'],
            'expires_at' => ['nullable', 'date'],
        ]);

        if (empty($validated['ip_address']) && empty($validated['cidr_subnet'])) {
            $this->alert->danger('You must specify either an IP address or a CIDR subnet to block.')->flash();
            return redirect()->route('admin.security.blocklist');
        }

        if (Schema::hasTable('security_blocklist')) {
            DB::table('security_blocklist')->insert([
                'ip_address' => $validated['ip_address'] ?: null,
                'cidr_subnet' => $validated['cidr_subnet'] ?: null,
                'reason' => $validated['reason'],
                'expires_at' => $validated['expires_at'] ?: null,
                'created_by' => $request->user()?->username ?? 'Admin',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $this->alert->success('IP / Subnet added to abuse blocklist.')->flash();
        }

        return redirect()->route('admin.security.blocklist');
    }

    public function destroy(int $id): RedirectResponse
    {
        if (Schema::hasTable('security_blocklist')) {
            DB::table('security_blocklist')->where('id', $id)->delete();
            $this->alert->success('Blocklist rule unblocked and deleted.')->flash();
        }

        return redirect()->route('admin.security.blocklist');
    }
}
