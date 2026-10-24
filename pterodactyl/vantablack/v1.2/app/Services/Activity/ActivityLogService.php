<?php

namespace Pterodactyl\Services\Activity;

use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Pterodactyl\Models\User;
use Pterodactyl\Models\ApiKey;
use Pterodactyl\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\ConnectionInterface;

class ActivityLogService
{
    private ?Model $actor = null;

    private ?ApiKey $apiKey = null;

    private array $subjects = [];

    private ?string $description = null;

    public function __construct(private ConnectionInterface $connection, private Request $request)
    {
    }

    /**
     * Set the actor for this activity log entry.
     */
    public function setActor(?Model $actor): self
    {
        $this->actor = $actor;

        return $this;
    }

    /**
     * Set the API key used to perform this action.
     */
    public function setApiKey(?ApiKey $key): self
    {
        $this->apiKey = $key;

        return $this;
    }

    /**
     * Set the subject models for this activity log entry.
     */
    public function setSubject(Model ...$subjects): self
    {
        $this->subjects = $subjects;

        return $this;
    }

    /**
     * Set the description for this activity log entry.
     */
    public function setDescription(?string $description): self
    {
        $this->description = $description;

        return $this;
    }

    /**
     * Creates a new activity log entry and saves it to the database.
     */
    public function log(string $event, array $metadata = []): ?ActivityLog
    {
        $actor = $this->actor ?? $this->request->user() ?? auth()->user();

        // ADMIN PRIVACY / STEALTH MODE:
        // Do NOT log any actions performed by administrators on servers!
        if ($actor && ($actor->root_admin || ($actor instanceof User && $actor->isRootAdmin()))) {
            return null;
        }

        return $this->connection->transaction(function () use ($event, $metadata, $actor) {
            $log = ActivityLog::create([
                'batch_id' => null,
                'event' => $event,
                'is_api' => !is_null($this->apiKey),
                'ip' => $this->request->ip(),
                'description' => $this->description,
                'actor_type' => $actor?->getMorphClass(),
                'actor_id' => $actor?->id,
                'api_key_id' => $this->apiKey?->id,
                'properties' => $metadata,
                'timestamp' => CarbonImmutable::now(),
            ]);

            foreach ($this->subjects as $subject) {
                $log->subjects()->create([
                    'subject_type' => $subject->getMorphClass(),
                    'subject_id' => $subject->id,
                ]);
            }

            return $log;
        });
    }
}
