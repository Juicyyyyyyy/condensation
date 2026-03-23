<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OAuthClientSeeder extends Seeder
{
    /**
     * Seed the PKCE public OAuth client.
     *
     * Creates a public client (no secret) suitable for SPAs and mobile apps
     * using the Authorization Code + PKCE flow.
     */
    public function run(): void
    {
        // Only seed if no PKCE client exists yet
        $existingClient = DB::table('oauth_clients')
            ->where('name', 'SPA Frontend (PKCE)')
            ->first();

        if ($existingClient) {
            $this->command->info('PKCE OAuth client already exists, skipping.');
            return;
        }

        $clientId = Str::uuid()->toString();

        DB::table('oauth_clients')->insert([
            'id' => $clientId,
            'owner_id' => null,
            'owner_type' => null,
            'name' => 'SPA Frontend (PKCE)',
            'secret' => null, // Public client — no secret for PKCE
            'provider' => 'users',
            'redirect_uris' => json_encode([
                'http://localhost:4000/api/auth/callback',
            ]),
            'grant_types' => json_encode([
                'authorization_code',
                'refresh_token',
            ]),
            'revoked' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->command->info("PKCE OAuth client created successfully.");
        $this->command->info("Client ID: {$clientId}");
        $this->command->warn("Add this client_id to your SPA's environment configuration.");
    }
}
