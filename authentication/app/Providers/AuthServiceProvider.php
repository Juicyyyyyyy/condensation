<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Passport\Passport;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Custom authorization consent view
        $this->app->bind(\Laravel\Passport\Contracts\AuthorizationViewResponse::class, function () {
            return new \Laravel\Passport\Http\Responses\SimpleViewResponse('auth.authorize');
        });

        // Token lifetimes
        Passport::tokensExpireIn(now()->addDays(15));
        Passport::refreshTokensExpireIn(now()->addDays(30));
        Passport::personalAccessTokensExpireIn(now()->addMonths(6));

        // Define OAuth scopes
        Passport::tokensCan([
            'read-profile' => 'Read your profile information',
            'update-profile' => 'Update your profile information',
        ]);

        Passport::setDefaultScope([
            'read-profile',
        ]);
    }
}
