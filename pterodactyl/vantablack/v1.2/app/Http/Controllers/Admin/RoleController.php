<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Models\User;
use Pterodactyl\Http\Controllers\Controller;

class RoleController extends Controller
{
    public function __construct(
        private AlertsMessageBag $alert,
    ) {
    }

    public function index(): View
    {
        $roles = [];
        if (Schema::hasTable('admin_roles')) {
            $roles = DB::table('admin_roles')
                ->orderBy('name')
                ->get();
        }

        $users = User::query()->where('root_admin', false)->orderBy('username')->get();

        $availablePermissions = [
            'admin.nodes' => 'Manage Nodes & Health',
            'admin.servers' => 'Manage & Suspend Servers',
            'admin.users' => 'Manage User Accounts',
            'admin.databases' => 'Database Hosts Management',
            'admin.locations' => 'Location Management',
            'admin.settings' => 'Panel & SEO Settings',
            'admin.security' => 'DDoS & IP Blocklist Management',
            'admin.announcements' => 'Broadcast Announcements',
        ];

        return view('admin.roles.index', [
            'roles' => $roles,
            'users' => $users,
            'availablePermissions' => $availablePermissions,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
            'permissions' => ['nullable', 'array'],
        ]);

        if (Schema::hasTable('admin_roles')) {
            DB::table('admin_roles')->insert([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? '',
                'permissions' => json_encode($validated['permissions'] ?? []),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $this->alert->success('Staff support role created.')->flash();
        }

        return redirect()->route('admin.roles');
    }

    public function destroy(int $id): RedirectResponse
    {
        if (Schema::hasTable('admin_roles')) {
            DB::table('admin_roles')->where('id', $id)->delete();
            $this->alert->success('Role deleted.')->flash();
        }

        return redirect()->route('admin.roles');
    }
}
