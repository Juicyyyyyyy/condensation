<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');
        $middleware->append(\Illuminate\Http\Middleware\HandleCors::class);

        // Rate-limit the public-facing OAuth endpoints. This also covers
        // /api/user, which is called internally by trusted services
        // (Spring Boot introspector, Next.js BFF) on every authenticated
        // request, so the limit has to be high enough to absorb bursts
        // from rapid navigation. Spring now caches introspections for
        // 60s, so in practice each browser session only drives a
        // handful of calls per minute even during heavy admin use.
        $middleware->throttleApi('600,1');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
