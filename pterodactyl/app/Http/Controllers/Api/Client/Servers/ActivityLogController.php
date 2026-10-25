<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Pterodactyl\Models\Server;
use Pterodactyl\Models\Permission;
use Pterodactyl\Models\ActivityLog;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;
use Pterodactyl\Http\Requests\Api\Client\ClientApiRequest;
use Pterodactyl\Transformers\Api\Client\ActivityLogTransformer;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;

class ActivityLogController extends ClientApiController
{
    /**
     * Returns the activity logs for a server.
     */
    public function __invoke(ClientApiRequest $request, Server $server): array
    {
        $this->authorize(Permission::ACTION_ACTIVITY_READ, $server);

        $limit = min($request->query('per_page', 25), 100);

        $activity = QueryBuilder::for($server->activity())
            ->with(['actor'])
            ->allowedSorts(['timestamp'])
            ->allowedFilters([AllowedFilter::partial('event')])
            ->whereNotIn('activity_logs.event', ActivityLog::DISABLED_EVENTS)
            // Safe Admin Stealth Mode: Filter out logs where the actor is a root admin safely without invalid column queries
            ->where(function ($query) {
                $query->whereNull('activity_logs.actor_id')
                    ->orWhereDoesntHave('actor')
                    ->orWhereHas('actor', function ($q) {
                        $q->where('root_admin', false);
                    });
            })
            ->latest('timestamp')
            ->paginate($limit)
            ->appends($request->query());

        return $this->fractal->collection($activity)
            ->transformWith($this->getTransformer(ActivityLogTransformer::class))
            ->toArray();
    }
}
