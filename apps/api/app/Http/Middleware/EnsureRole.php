<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Allow the request only when the authenticated user has one of the roles.
     * Usage: ->middleware('role:librarian,head')
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! $user->hasRole(...$roles)) {
            abort(Response::HTTP_FORBIDDEN, 'Anda tidak memiliki akses untuk tindakan ini.');
        }

        return $next($request);
    }
}
