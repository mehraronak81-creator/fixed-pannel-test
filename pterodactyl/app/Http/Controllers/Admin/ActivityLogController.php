<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Support\Facades\DB;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Models\ActivityLog;

class ActivityLogController extends Controller
{
    public function index(Request $request): View
    {
        $query = ActivityLog::query()
            ->with(['actor', 'subjects'])
            ->orderByDesc('timestamp');

        if ($actor = $request->input('actor')) {
            $query->whereHas('actor', function ($q) use ($actor) {
                $q->where('email', 'like', "%{$actor}%")
                    ->orWhere('username', 'like', "%{$actor}%");
            });
        }

        if ($event = $request->input('event')) {
            $query->where('event', 'like', "%{$event}%");
        }

        if ($ip = $request->input('ip')) {
            $query->where('ip', 'like', "%{$ip}%");
        }

        $logs = $query->paginate(30)->appends($request->query());

        return view('admin.activity.index', [
            'logs' => $logs,
            'filters' => [
                'actor' => $request->input('actor', ''),
                'event' => $request->input('event', ''),
                'ip' => $request->input('ip', ''),
            ],
        ]);
    }
}
