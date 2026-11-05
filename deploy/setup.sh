#!/usr/bin/env bash
# Установка сайта INLY на сервер (Ubuntu). Запуск: curl -fsSL https://raw.githubusercontent.com/ilnur281/inly-site/main/deploy/setup.sh | bash
set -euo pipefail
REPO="https://github.com/ilnur281/inly-site.git"
DIR="/var/www/inly-site"
DOMAIN="inlyhome.ru"

echo "== 1/5 Пакеты =="
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y nginx git certbot python3-certbot-nginx

echo "== 2/5 Сайт из GitHub =="
if [ -d "$DIR/.git" ]; then git -C "$DIR" pull -q; else git clone -q --depth 1 "$REPO" "$DIR"; fi

echo "== 3/5 Настройка nginx =="
cat > /etc/nginx/sites-available/inly <<NGINX
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name $DOMAIN www.$DOMAIN _;
    root $DIR;
    index index.html;
    location ~ /\.git { deny all; }
    location /deploy/ { deny all; }
    location ~* \.(css|js|jpg|jpeg|png|webp|svg|woff2?)\$ { expires 7d; add_header Cache-Control "public"; }
    location / { try_files \$uri \$uri/ =404; }
}
NGINX
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/inly /etc/nginx/sites-enabled/inly
nginx -t
systemctl enable --now nginx
systemctl reload nginx

echo "== 4/5 Автообновление из GitHub (каждые 5 минут) =="
echo "*/5 * * * * root git -C $DIR pull -q >/dev/null 2>&1" > /etc/cron.d/inly-site
chmod 644 /etc/cron.d/inly-site

echo "== 5/5 Файрвол =="
if command -v ufw >/dev/null && ufw status | grep -q active; then ufw allow 'Nginx Full' || true; fi

IP=$(hostname -I | awk '{print $1}')
echo
echo "ГОТОВО: сайт открывается по адресу http://$IP"
echo "Когда заработает домен, запустите HTTPS: bash $DIR/deploy/ssl.sh"
