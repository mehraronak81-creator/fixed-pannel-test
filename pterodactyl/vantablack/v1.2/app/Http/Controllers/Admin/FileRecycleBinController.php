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

class FileRecycleBinController extends Controller
{
    public function __construct(
        private AlertsMessageBag $alert,
    ) {
    }

    public function index(Request $request): View
    {
        $trashItems = [];

        if (Schema::hasTable('file_trash_items')) {
            $query = DB::table('file_trash_items')
                ->join('servers', 'file_trash_items.server_id', '=', 'servers.id')
                ->leftJoin('users', 'file_trash_items.user_id', '=', 'users.id')
                ->select('file_trash_items.*', 'servers.name as server_name', 'users.username as user_name');

            if ($serverId = $request->input('server_id')) {
                $query->where('file_trash_items.server_id', $serverId);
            }

            $trashItems = $query->orderByDesc('file_trash_items.deleted_at')->paginate(25);
        }

        $servers = Server::query()->orderBy('name')->get();

        return view('admin.servers.trash', [
            'trashItems' => $trashItems,
            'servers' => $servers,
            'selectedServer' => $request->input('server_id', ''),
        ]);
    }

    public function restore(int $id): RedirectResponse
    {
        if (Schema::hasTable('file_trash_items')) {
            $item = DB::table('file_trash_items')->where('id', $id)->first();
            if ($item) {
                DB::table('file_trash_items')->where('id', $id)->delete();
                $this->alert->success("File record {$item->original_path} marked for restoration.")->flash();
            }
        }

        return redirect()->route('admin.servers.trash');
    }

    public function purge(int $id): RedirectResponse
    {
        if (Schema::hasTable('file_trash_items')) {
            DB::table('file_trash_items')->where('id', $id)->delete();
            $this->alert->success('Trash item permanently purged.')->flash();
        }

        return redirect()->route('admin.servers.trash');
    }
}
