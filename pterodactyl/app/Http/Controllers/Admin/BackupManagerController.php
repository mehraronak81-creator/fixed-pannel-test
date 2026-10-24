<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Models\Node;
use Pterodactyl\Http\Controllers\Controller;

class BackupManagerController extends Controller
{
    public function __construct(
        private AlertsMessageBag $alert,
    ) {
    }

    public function index(): View
    {
        $policies = [];
        $runs = [];

        if (Schema::hasTable('backup_policies')) {
            $policies = DB::table('backup_policies')
                ->orderByDesc('id')
                ->get();
        }

        if (Schema::hasTable('backup_policy_runs')) {
            $runs = DB::table('backup_policy_runs')
                ->join('backup_policies', 'backup_policy_runs.policy_id', '=', 'backup_policies.id')
                ->select('backup_policy_runs.*', 'backup_policies.name as policy_name')
                ->orderByDesc('backup_policy_runs.started_at')
                ->limit(30)
                ->get();
        }

        $nodes = Node::query()->orderBy('name')->get();

        return view('admin.backups.index', [
            'policies' => $policies,
            'runs' => $runs,
            'nodes' => $nodes,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'cron_expression' => ['required', 'string', 'max:100'],
            'max_backups' => ['required', 'integer', 'min:1', 'max:50'],
        ]);

        if (Schema::hasTable('backup_policies')) {
            DB::table('backup_policies')->insert([
                'name' => $validated['name'],
                'cron_expression' => $validated['cron_expression'],
                'max_backups' => $validated['max_backups'],
                'locked' => $request->has('locked'),
                'is_active' => $request->has('is_active'),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $this->alert->success('Global backup policy created successfully.')->flash();
        }

        return redirect()->route('admin.backups');
    }

    public function destroy(int $id): RedirectResponse
    {
        if (Schema::hasTable('backup_policies')) {
            DB::table('backup_policies')->where('id', $id)->delete();
            $this->alert->success('Backup policy deleted.')->flash();
        }

        return redirect()->route('admin.backups');
    }
}
