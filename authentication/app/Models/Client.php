<?php

namespace App\Models;

use Laravel\Passport\Client as BaseClient;

class Client extends BaseClient
{
    /**
     * Determine if the client should skip the authorization prompt.
     * Overrides Laravel Passport's default restrictive behavior.
     */
    public function skipsAuthorization($user, array $scopes): bool
    {
        // First party clients (our frontend SPA where owner_id is empty) automatically
        // bypass the "Do you authorize this app" manual UI.
        return $this->firstParty();
    }
}
