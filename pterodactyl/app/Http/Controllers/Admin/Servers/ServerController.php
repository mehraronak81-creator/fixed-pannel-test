<?php

namespace Pterodactyl\Http\Controllers\Admin\Servers;

use Illuminate\View\View;
use Illuminate\Http\Request;
use Pterodactyl\Models\Server;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Models\Filters\AdminServerFilter;

class ServerController extends Controller
{
    /**
     * Returns all the servers that exist on the system using a paginated result set. If
     * a query is passed along in the request it is also passed to the repository function.
     */
    public function index(Request $request): View
    {
        $servers = QueryBuilder::for(Server::query()->with(['node', 'user', 'allocation']))
            ->allowedFilters([
                'name',
                'owner_id',
                'node_id',
                'status',
                'uuid',
                'external_id',
                AllowedFilter::exact('owner_id'),
                AllowedFilter::exact('node_id'),
                AllowedFilter::callback('status', function ($query, $value) {
                    if ($value === 'active') {
                        $query->whereNull('status');
                    } elseif ($value === 'suspended') {
                        $query->where('status', 'suspended');
                    } elseif (!empty($value)) {
                        $query->where('status', $value);
                    }
                }),
                AllowedFilter::custom('*', new AdminServerFilter()),
            ])
            ->allowedSorts(['name', 'id', 'cpu', 'memory', 'disk'])
            ->paginate(25)
            ->appends($request->query());

        return view('admin.servers.index', ['servers' => $servers]);
    }
}
