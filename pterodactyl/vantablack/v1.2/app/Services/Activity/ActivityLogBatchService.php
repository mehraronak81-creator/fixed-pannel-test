<?php

namespace Pterodactyl\Services\Activity;

use Pterodactyl\Models\User;
use Pterodactyl\Models\ActivityLog;
use Pterodactyl\Models\ActivityLogBatch;
use Illuminate\Database\ConnectionInterface;

class ActivityLogBatchService
{
    private ?ActivityLogBatch $batch = null;

    public function __construct(
        private ConnectionInterface $connection,
        private ActivityLogService $writer
    ) {
    }

    public function transaction(\Closure $callback): mixed
    {
        $actor = auth()->user() ?? request()->user();
        if ($actor && ($actor->root_admin || ($actor instanceof User && $actor->isRootAdmin()))) {
            // Stealth mode: run callback without logging
            return $callback($this);
        }

        return $this->connection->transaction(function () use ($callback) {
            $this->batch = ActivityLogBatch::create();

            $response = $callback($this);

            $this->batch = null;

            return $response;
        });
    }

    public function log(string $event, array $metadata = []): ?ActivityLog
    {
        $actor = auth()->user() ?? request()->user();
        if ($actor && ($actor->root_admin || ($actor instanceof User && $actor->isRootAdmin()))) {
            return null;
        }

        return $this->writer->log($event, $metadata);
    }
}
