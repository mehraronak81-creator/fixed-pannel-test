<?php

/*
|--------------------------------------------------------------------------
| Vantablack additional client API routes
|--------------------------------------------------------------------------
|
| These routes extend the base panel's routes/api-client.php. They are kept in
| a separate file so upgrades to the theme do not clobber the core client
| routes. To activate, add the following line at the BOTTOM of the base
| routes/api-client.php file (inside the same file, after the last route):
|
|     require __DIR__ . '/api-client-vantablack.php';
|
| Everything here is registered under the same /api/client prefix and auth
| middleware as the rest of the client routes because it is required from
| within that file.
|
*/

use Illuminate\Support\Facades\Route;
use Pterodactyl\Http\Controllers\Api\Client\Servers\FileTrashController;

Route::group([
    'prefix' => '/servers/{server}',
    'middleware' => [
        \Pterodactyl\Http\Middleware\Api\Client\Server\AuthenticateServerAccess::class,
        \Pterodactyl\Http\Middleware\Api\Client\Server\ResourceBelongsToServer::class,
    ],
], function () {
    // Records deleted files into the admin recycle bin (best-effort audit).
    Route::post('/files/trash-record', [FileTrashController::class, 'store']);
});
