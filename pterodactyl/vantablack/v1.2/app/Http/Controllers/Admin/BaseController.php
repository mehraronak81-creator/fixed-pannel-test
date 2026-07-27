<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Illuminate\View\View;
use Pterodactyl\Models\Node;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\User;
use Pterodactyl\Models\Location;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Services\Helpers\SoftwareVersionService;

class BaseController extends Controller
{
    public function __construct(private SoftwareVersionService $version)
    {
    }

    /**
     * Return the VantaHost administration overview.
     */
    public function index(): View
    {
        return view('admin.index', [
            'version' => $this->version,
            'fleet' => [
                'servers' => Server::query()->count(),
                'suspended' => Server::query()->where('status', Server::STATUS_SUSPENDED)->count(),
                'users' => User::query()->count(),
                'nodes' => Node::query()->count(),
                'locations' => Location::query()->count(),
            ],
            'nodes' => Node::query()
                ->with('location')
                ->withCount('servers')
                ->orderBy('name')
                ->get(),
        ]);
    }
}