# Deploy this marketing site on Dokploy

This repo is the **Clearview Global marketing site** (Vite + Express). Deploy it as a **new Dokploy Application**. It is not ClearPath-App-Mobile.

Your VPS already has Dokploy, Traefik, Docker, and Swarm. Traefik owns **80** and **443**. Do **not** also install or start host nginx / Certbot / PM2 for this site. Do **not** open ClearPath-App-Mobile and point it at this repo.

## 0. Before you click (once)

1. **DNS** — A records for the marketing hostname (and `www` if you use it) already point at this VPS.
2. **Mailbox** — in **hPanel → Emails**, create/enable a Hostinger mailbox with SMTP. Dokploy only stores the password as an env var; it does not create the mailbox.
3. **Git** — this project must be on the Git host Dokploy can clone (GitHub/GitLab/etc.). Push these files (`Dockerfile`, `server/index.js`, …) before you deploy.
4. Confirm **ClearPath-App-Mobile** stays untouched.

Typical Hostinger SMTP:

- Host: `smtp.hostinger.com`
- Port **465** + `SMTP_SECURE=true` (SSL), or port **587** + `SMTP_SECURE=false` (STARTTLS)

## 1. Open or pick a project

1. Left sidebar → **Home**, then **Projects** (or **Projects** directly).
2. Open the production project you already use (the one that lists **ClearPath-App-Mobile**).
3. Keep that mobile app as it is. Add a **second** service in the same project.

You can create a separate project instead. Either way: new application, not a replacement.

Recommended application name: **Clearview-Website**.

## 2. Create Application (not Compose)

1. In the project, click **Create Service** / the **+** control.
2. Choose **Application**.
   - Not **Compose** (this repo has no compose file).
   - Not **Database**.
   - Not “edit the existing ClearPath-App-Mobile service.”
3. Name it `Clearview-Website` (or similar).
4. Create / confirm. You should now see **two** services: ClearPath-App-Mobile **and** this one.

## 3. Connect Git

Dokploy’s left **Git** item is for linking GitHub/GitLab accounts. The Application still needs a repo selected.

**If GitHub (or GitLab) is not connected yet**

1. Sidebar → **Git**.
2. Add the provider and install/authorize access to the account or org that owns this repo.
3. Return to the **Clearview-Website** application.

**On the application**

1. Open **Clearview-Website**.
2. Provider: **GitHub** / **GitLab** / **Git** (whichever you use).
3. Select **this** repository (Clearview Global Revision), branch **`main`**.
4. Save.

## 4. Build: Dockerfile (not Nixpacks)

On the application **General** / build settings:

| Setting | Value |
|---|---|
| Build type | **Dockerfile** |
| Dockerfile path | `Dockerfile` |
| Docker context | `.` (repo root) |
| Container / app port | **8787** |

Do **not** use Nixpacks or “buildpack” + `npm start` as the only strategy. The Dockerfile runs `npm run build`, copies `dist/` into the image, and starts `node server/index.js` with `NODE_ENV=production`.

**8787** must match all of: `EXPOSE` in the Dockerfile, `API_PORT` in env, and the domain’s **container port** (next step). Some Dokploy screens put the port only on the domain row.

## 5. Domain + HTTPS (Traefik)

1. Application tab **Domains** → **Add Domain**.
2. Host: the marketing hostname (example: `clearviewglobal.com`).
3. Path: `/`
4. **Container port / internal port: `8787`**
5. Enable HTTPS / Let’s Encrypt (Dokploy + Traefik).
6. Add a second domain row for `www` if you use it; point both DNS records at this VPS.

Do not run `certbot` on the host. Do not add a host nginx `server` block for this site.

Sidebar **Traefik** should already be running; Dokploy attaches this application to it when the domain is saved.

## 6. Environment variables

Application tab **Environment**. Paste in the Dokploy UI (not into git). Leave passwords out of the repo.

```
NODE_ENV=production
API_PORT=8787
API_HOST=0.0.0.0
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=
SMTP_PASS=
MAIL_FROM=
MAIL_TO=info@clearviewglobal.com
MAIL_CC=
MAIL_BCC=
```

Fill `SMTP_USER`, `SMTP_PASS`, and `MAIL_FROM` with the Hostinger mailbox. `MAIL_FROM` is usually the same address as `SMTP_USER`.

**Several inboxes:** one mailbox for SMTP login; list every destination in `MAIL_TO`, comma-separated, no extra spaces required (spaces are trimmed):

```
MAIL_TO=info@clearviewglobal.com,other@clearviewglobal.com
```

Optional: `MAIL_CC` and `MAIL_BCC`, same format.

`API_PORT` must stay **8787** unless you change `EXPOSE` and the domain container port too.

## 7. Deploy and check

1. Click **Deploy**.
2. Open **Deployments** / **Logs**.
   - Build stage: `npm ci`, then `vite build`.
   - Runtime log: `Clearview site listening on 0.0.0.0:8787`
3. Browser: `https://your-domain/` — marketing site (not an API JSON page).
4. `https://your-domain/api/health` — `{"ok":true}`
5. Submit the Le Parc form. Confirm mail at every `MAIL_TO` address (and spam).

Form **500** almost always means SMTP env is missing/wrong, or Hostinger rejected the login. Fix the env in Dokploy, **redeploy or restart** the application, retry.

Later deploys: push to `main` and click **Deploy**, or turn on auto-deploy / webhook if that toggle is on the application.

## Do not

- Replace or rebuild **ClearPath-App-Mobile** with this repo.
- Run a second nginx or PM2 stack on this VPS for the marketing site.
- Bind host nginx to **80/443** (Traefik already has them).
- Put `SMTP_PASS` in git, the Dockerfile, or `DOKPLOY.md`.
- Expose 8787 on the public firewall; only Traefik should reach it on the Docker/Swarm network.

If you previously started host nginx for this site, stop it so Traefik can keep 80/443:

```bash
sudo systemctl stop nginx
sudo systemctl disable nginx
```

Only do that if nginx is not serving something else you still need **on this same VPS**. ClearPath-App-Mobile should stay on Dokploy, not on host nginx.

## What the container does

- `GET /` and other non-`/api` routes → Vite `dist/` (SPA fallback → `index.html`)
- `GET /api/health` → `{"ok":true}`
- `POST /api/le-parc-inquiry` → SMTP
- Unknown `/api/*` → JSON 404, not the React app
