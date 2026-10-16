#!/bin/sh
set -eu

port="${PORT:-10000}"
case "$port" in
    ''|*[!0-9]*)
        echo "PORT must be a valid numeric port" >&2
        exit 1
        ;;
esac

if [ "${DB_CONNECTION:-sqlite}" = "pgsql" ] \
    && [ -z "${DB_URL:-${DATABASE_URL:-}}" ] \
    && { [ -z "${DB_HOST:-}" ] || [ "$DB_HOST" = "127.0.0.1" ] || [ "$DB_HOST" = "localhost" ]; }; then
    echo "PostgreSQL is enabled, but no remote database is configured." >&2
    echo "Set DATABASE_URL to your Render/Neon PostgreSQL connection string, or set DB_HOST to the database host." >&2
    exit 1
fi

php artisan migrate --force

sed -ri "s/^Listen 80$/Listen ${port}/" /etc/apache2/ports.conf
sed -ri "s/<VirtualHost \*:80>/<VirtualHost *:${port}>/" /etc/apache2/sites-available/*.conf

exec apache2-foreground
