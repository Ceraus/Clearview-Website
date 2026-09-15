# Le Parc inquiry API

The site form `POST`s to `/api/le-parc-inquiry`. This Node process sends mail over **SMTP**. Recipients come from `MAIL_TO` (comma-separated). Secrets stay in `.env` on the server — never in the frontend or git.

**Dokploy (this VPS already has Traefik):** [`DOKPLOY.md`](../DOKPLOY.md). **Host nginx + PM2 instead:** [`HOSTINGER.md`](../HOSTINGER.md). Do not run both.

## Scripts

| Command | What it does |
|---|---|
| `npm run start:api` | Same as `npm start` — run `server/index.js` |
| `npm start` | `server/index.js` — in production also serves `dist/` |
| `npm run build` | Vite → `dist/` |
| `npm run dev` | API + Vite together; Vite proxies `/api` to Node (**dev only**) |

`NODE_ENV=production` serves `dist/` from this process (Dokploy one-container). The Hostinger nginx path still reverse-proxies `/api` and can keep `API_HOST=127.0.0.1`. Do not rely on the Vite proxy in production.

## 1. Mailbox (you create this)

1. In **hPanel → Emails**, create a mailbox on the site domain. Same domain as the website is better for deliverability.
2. Enable SMTP. Hostinger’s usual settings:
   - Host: `smtp.hostinger.com`
   - Port **465** + SSL (`SMTP_SECURE=true`), or port **587** + STARTTLS (`SMTP_SECURE=false`)
3. Put the mailbox address and password in `.env` (`SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`). Do not commit the password.

**Several inboxes:** keep one mailbox for SMTP login, then list every destination in `MAIL_TO`:

```
MAIL_TO=info@clearviewglobal.com,other@clearviewglobal.com
```

Optional extras: `MAIL_CC` and `MAIL_BCC` (same comma-separated format).

## 2. Env on the VPS

Copy `.env.example` to `.env` in the project root (next to `package.json`). Fill SMTP + mail fields. Set `NODE_ENV=production`. After any `.env` change, restart the API (`pm2 restart clearview-api`).

## 3. Local / one-off

```bash
npm ci
npm run build
npm start
```

PM2 (`ecosystem.config.cjs`) is only for the nginx path. Bind `API_HOST=127.0.0.1` there. Dokploy listens on `0.0.0.0` inside the container.

## 4. Test

1. `curl -s http://127.0.0.1:8787/api/health` → `{"ok":true}`
2. Submit the Le Parc form on the live site.
3. Check every address in `MAIL_TO` (and CC/BCC). Look in **spam** if nothing arrives.
4. Reply-To on the message is the inquirer’s email.

A 500 from the form usually means SMTP env is missing or Hostinger rejected the login — fix `.env`, restart PM2, try again. The form will not pretend the send succeeded.
