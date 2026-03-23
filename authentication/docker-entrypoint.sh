#!/bin/bash
set -e

echo "Waiting for database connection..."
# Wait for Database to be ready
if [ "$DB_CONNECTION" = "pgsql" ]; then
    until PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USERNAME" -d "$DB_DATABASE" -c '\q' > /dev/null 2>&1; do
        echo "Postgres is unavailable - sleeping"
        sleep 1
    done
else
    until mysqladmin ping -h "$DB_HOST" -u "$DB_USERNAME" -p"$DB_PASSWORD" --skip-ssl --silent; do
        echo "MySQL is unavailable - sleeping"
        sleep 1
    done
fi

echo "Database is up - running migrations"
php artisan migrate --force

# Generate Passport encryption keys if they don't exist
if [ ! -f storage/oauth-private.key ]; then
    echo "Generating Passport keys..."
    php artisan passport:keys
    chown www-data:www-data storage/oauth-*.key
fi

# Seed the PKCE client if the database was just initialized
php artisan db:seed --class=Database\\Seeders\\OAuthClientSeeder --force 2>/dev/null || true

echo "Clearing and caching config..."
php artisan config:cache
php artisan route:cache

echo "Starting server"
exec "$@"
