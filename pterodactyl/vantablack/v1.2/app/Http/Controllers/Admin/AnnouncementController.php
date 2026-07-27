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

class AnnouncementController extends Controller
{
    public function __construct(
        private AlertsMessageBag $alert,
    ) {
    }

    public function index(): View
    {
        $nodes = Node::query()->orderBy('name')->get();
        $announcements = [];
        if (Schema::hasTable('announcements')) {
            $announcements = DB::table('announcements')
                ->orderByDesc('id')
                ->get();
        }

        return view('admin.announcements.index', [
            'nodes' => $nodes,
            'announcements' => $announcements,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'type' => ['required', 'string', 'in:info,warning,danger,success'],
            'node_id' => ['nullable', 'integer'],
            'is_dismissible' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        if (Schema::hasTable('announcements')) {
            DB::table('announcements')->insert([
                'title' => $validated['title'],
                'content' => $validated['content'],
                'type' => $validated['type'],
                'node_id' => $validated['node_id'] ?: null,
                'is_dismissible' => $request->has('is_dismissible'),
                'is_active' => $request->has('is_active'),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $this->alert->success('Announcement posted successfully.')->flash();
        } else {
            $this->alert->danger('Announcements database table is missing. Run database migrations first.')->flash();
        }

        return redirect()->route('admin.announcements');
    }

    public function destroy(int $id): RedirectResponse
    {
        if (Schema::hasTable('announcements')) {
            DB::table('announcements')->where('id', $id)->delete();
            $this->alert->success('Announcement deleted.')->flash();
        }

        return redirect()->route('admin.announcements');
    }
}
