#!/bin/sh
set -eu

port="${PORT:-10000}"
case "$port" in
    ''|*[!0-9]*)
        echo "PORT must be a valid numeric port" >&2
        exit 1
        ;;
esac

sed -ri "s/^Listen 80$/Listen ${port}/" /etc/apache2/ports.conf
sed -ri "s/<VirtualHost \*:80>/<VirtualHost *:${port}>/" /etc/apache2/sites-available/*.conf

exec apache2-foreground
