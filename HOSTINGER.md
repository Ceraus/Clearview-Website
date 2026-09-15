# Hostinger VPS deploy

**Already running Dokploy on this VPS?** Do not follow this nginx + PM2 guide. Host nginx on 80/443 fights Dokploy’s Traefik. Deploy this marketing site as a **new Application** using [`DOKPLOY.md`](./DOKPLOY.md). Do not replace ClearPath-App-Mobile.

This file is the **non-Dokploy** path: **nginx** serves `dist/` at the domain root and reverse-proxies `/api` to Node on `127.0.0.1:8787` (PM2). Vite’s `base` is `/`. The Vite `/api` proxy is **dev-only**; production does not use it.

Node **20+** (`engines.node` in `package.json`). Do not expose port `8787` on the public firewall.

## 1. Mailbox (you do this in hPanel)

1. **hPanel → Emails** — create a mailbox on the site domain.
2. Enable SMTP. Typical Hostinger values:
   - Host: `smtp.hostinger.com`
   - Port **465** + SSL (`SMTP_SECURE=true`), or **587** + STARTTLS (`SMTP_SECURE=false`)
3. One mailbox is enough for SMTP login. Put every destination inbox in `MAIL_TO` (comma-separated). Optional: `MAIL_CC`, `MAIL_BCC`.

Never commit `.env` or the mailbox password.

## 2. Server prep

SSH into the VPS (Ubuntu). Point the domain’s A record at this VPS.

```bash
sudo apt update
sudo apt install -y nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # v20.x
sudo npm i -g pm2
```

Firewall — SSH, HTTP, HTTPS only. Leave `8787` closed:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

## 3. App files, env, build

```bash
sudo mkdir -p /var/www/clearview
sudo chown "$USER":"$USER" /var/www/clearview
# clone or upload the project into /var/www/clearview
cd /var/www/clearview

cp .env.example .env
nano .env
```

Fill `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, and `MAIL_TO`. Keep `NODE_ENV=production`, `API_PORT=8787`, and `API_HOST=127.0.0.1` (loopback-only behind nginx).

```bash
npm ci
npm run build
```

`npm start` and `npm run start:api` both run `server/index.js`. Use PM2 in production, not a raw `npm start` in the foreground.

## 4. PM2

From `/var/www/clearview` (so dotenv finds `.env` next to `package.json`):

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
# follow the command pm2 prints, then:
pm2 save
```

Restart after any `.env` change: `pm2 restart clearview-api`.

Health check (loopback only):

```bash
curl -s http://127.0.0.1:8787/api/health
# {"ok":true}
```

## 5. Nginx

`server/nginx.example.conf` is HTTP-only so `nginx -t` works before certificates exist.

```bash
sudo cp /var/www/clearview/server/nginx.example.conf /etc/nginx/sites-available/clearview
sudo nano /etc/nginx/sites-available/clearview   # set server_name + root
sudo ln -sf /etc/nginx/sites-available/clearview /etc/nginx/sites-enabled/clearview
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

## 6. SSL

**Certbot (typical on a Hostinger VPS):** DNS A records must already point at this VPS.

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d clearviewglobal.com -d www.clearviewglobal.com
```

Replace the domain with yours. Certbot adds 443, HTTPS redirects, and renewals.

**Hostinger SSL:** if hPanel issued certificates for this VPS, add `listen 443 ssl` plus `ssl_certificate` / `ssl_certificate_key` pointing at those files, then `sudo nginx -t && sudo systemctl reload nginx`.

## 7. Check

1. Open `https://your-domain/` — static site from `dist`.
2. Submit the Le Parc form (`POST /api/le-parc-inquiry`).
3. Confirm mail at every `MAIL_TO` address (and spam).
4. Form 500 = missing/wrong SMTP env or Hostinger rejected login. Fix `.env`, `pm2 restart clearview-api`, retry.

Redeploy later:

```bash
cd /var/www/clearview
git pull   # or upload files
npm ci
npm run build
pm2 restart clearview-api
```
