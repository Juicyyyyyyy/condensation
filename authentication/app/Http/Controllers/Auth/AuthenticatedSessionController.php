<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;
use Throwable;

/**
 * @group Authentication
 */
class AuthenticatedSessionController extends Controller
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
     * Display the login view.
     *
     * @group Authentication
     * @subgroup Login
     */
    public function create(): View
    {
        $this->debugLog('H2', 'app/Http/Controllers/Auth/AuthenticatedSessionController.php:create', 'Login view requested', [
            'view_exists_auth_login' => view()->exists('auth.login'),
            'view_exists_component_direct' => view()->exists('components.condensation-guest-layout'),
            'view_exists_component_short' => view()->exists('condensation-guest-layout'),
        ]);
        return view('auth.login');
    }

    /**
     * Authenticate a user and create a session.
     *
     * @group Authentication
     * @subgroup Login
     * 
     * @bodyParam email string required The user's email address. Example: john@example.com
     * @bodyParam password string required The user's password. Example: password123
     * @bodyParam remember boolean Whether to remember the user. Example: false
     * 
     * @response 302
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Logout the authenticated user.
     *
     * @group Authentication
     * @subgroup Login
     * @authenticated
     * 
     * @response 302
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
