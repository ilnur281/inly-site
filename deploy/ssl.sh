#!/usr/bin/env bash
# Бесплатный HTTPS (Let's Encrypt) для inlyhome.ru. Запускать, когда домен уже открывается.
set -euo pipefail
DOMAIN="inlyhome.ru"
ARGS=(-d "$DOMAIN")
if getent hosts "www.$DOMAIN" >/dev/null; then ARGS+=(-d "www.$DOMAIN"); fi
certbot --nginx "${ARGS[@]}" --non-interactive --agree-tos --register-unsafely-without-email --redirect
echo "ГОТОВО: https://$DOMAIN"
