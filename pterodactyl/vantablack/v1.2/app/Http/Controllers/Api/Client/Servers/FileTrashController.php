<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Pterodactyl\Models\Server;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;

/**
 * Records file deletions performed through the panel file manager into the
 * recycle-bin tracking table so administrators can review what was removed and
 * from which server.
 *
 * This is intentionally a lightweight audit record. It is written best-effort
 * from the frontend after a successful delete; if the table does not exist the
 * request is silently accepted so the file manager keeps working.
 */
class FileTrashController extends ClientApiController
{
    /**
     * Store one or more trash records for files that were just deleted.
     */
    public function store(Request $request, Server $server): JsonResponse
    {
        $data = $request->validate([
            'directory' => ['required', 'string'],
            'files' => ['required', 'array', 'max:500'],
            'files.*' => ['string'],
        ]);

        if (!Schema::hasTable('file_trash_items')) {
            return new JsonResponse(['recorded' => 0], JsonResponse::HTTP_ACCEPTED);
        }

        $directory = rtrim($data['directory'], '/');
        $now = now();
        $rows = [];

        foreach ($data['files'] as $name) {
            $name = ltrim((string) $name, '/');
            if ($name === '') {
                continue;
            }

            $path = $directory === '' ? '/' . $name : $directory . '/' . $name;

            $rows[] = [
                'server_id' => $server->id,
                'user_id' => $request->user()?->id,
                'original_path' => mb_substr($path, 0, 191),
                'trash_filename' => mb_substr($name, 0, 191),
                'size_bytes' => 0,
                'deleted_at' => $now,
                'purge_at' => $now->copy()->addDays(30),
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if (!empty($rows)) {
            DB::table('file_trash_items')->insert($rows);
        }

        return new JsonResponse(['recorded' => count($rows)], JsonResponse::HTTP_CREATED);
    }
}
