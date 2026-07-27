<?php

namespace Pterodactyl\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\HttpFoundation\Response;

class EnforceIpBlocklist
{
    public function handle(Request $request, Closure $next): Response
    {
        $clientIp = $request->ip();

        if ($clientIp && Schema::hasTable('security_blocklist')) {
            $isBlocked = DB::table('security_blocklist')
                ->where(function ($query) use ($clientIp) {
                    $query->where('ip_address', $clientIp)
                        ->orWhere('cidr_subnet', $clientIp);
                })
                ->where(function ($query) {
                    $query->whereNull('expires_at')
                        ->orWhere('expires_at', '>', now());
                })
                ->exists();

            if ($isBlocked) {
                abort(403, 'Access denied: Your IP address or subnet has been restricted by panel security policy.');
            }
        }

        return $next($request);
    }
}
