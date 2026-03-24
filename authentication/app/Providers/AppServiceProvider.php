<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Laravel\Passport\Passport;
use Throwable;

class AppServiceProvider extends ServiceProvider
{
    private function debugLog(string $hypothesisId, string $location, string $message, array $data = []): void
    {
        // #region agent log
        try {
            file_get_contents('http://127.0.0.1:7883/ingest/ca05ea8e-7a42-4710-9f28-9ec27b8a94c5', false, stream_context_create([
                'http' => [
                    'method' => 'POST',
                    'header' => "Content-Type: application/json\r\nX-Debug-Session-Id: e8cad2\r\n",
                    'content' => json_encode([
                        'sessionId' => 'e8cad2',
                        'runId' => 'pre-fix',
                        'hypothesisId' => $hypothesisId,
                        'location' => $location,
                        'message' => $message,
                        'data' => $data,
                        'timestamp' => (int) round(microtime(true) * 1000),
                    ], JSON_UNESCAPED_SLASHES),
                    'ignore_errors' => true,
                    'timeout' => 1,
                ],
            ]));
        } catch (Throwable) {
            // no-op for debug logging
        }
        // #endregion
    }

    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Passport::useClientModel(Client::class);
        $componentPath = resource_path('views/components/condensation-guest-layout.blade.php');
        $this->debugLog('H1', 'app/Providers/AppServiceProvider.php:boot', 'Component file existence check', [
            'component_path' => $componentPath,
            'file_exists' => file_exists($componentPath),
            'view_exists_components' => view()->exists('components.condensation-guest-layout'),
            'view_exists_short' => view()->exists('condensation-guest-layout'),
        ]);
        // Rate limit for OAuth token endpoints
        RateLimiter::for('oauth', function (Request $request) {
            return Limit::perMinute(20)->by($request->ip());
        });

        // Rate limit for API endpoints
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });
    }
}
