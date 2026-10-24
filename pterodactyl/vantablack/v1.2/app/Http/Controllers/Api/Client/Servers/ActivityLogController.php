<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Pterodactyl\Models\Server;
use Pterodactyl\Models\ActivityLog;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Pterodactyl\Http\Requests\Api\Client\ClientApiRequest;
use Pterodactyl\Transformers\Api\Client\ActivityLogTransformer;

class ActivityLogController extends ClientApiController
{
    public function __invoke(ClientApiRequest $request, Server $server): array
    {
        $limit = min($request->query('per_page') ?? 25, 100);

        $activity = ActivityLog::query()
            ->with(['actor'])
            ->where(function ($query) use ($server) {
                $query->where('subject_type', $server->getMorphClass())
                    ->where('subject_id', $server->id)
                    ->orWhereHas('subjects', function ($q) use ($server) {
                        $q->where('subject_type', $server->getMorphClass())
                            ->where('subject_id', $server->id);
                    });
            })
            // Stealth Mode: Hide any admin actions from server owners & subusers!
            ->where(function ($query) {
                $query->whereNull('actor_id')
                    ->orWhereDoesntHave('actor')
                    ->orWhereHas('actor', function ($q) {
                        $q->where('root_admin', false);
                    });
            })
            ->latest('timestamp')
            ->paginate($limit);

        return $this->fractal->collection($activity)
            ->transformWith(ActivityLogTransformer::class)
            ->toArray();
    }
}
