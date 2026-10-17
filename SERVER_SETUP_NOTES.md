# Server Setup Handoff — uniform-coordination (as of 2026-08-01)

Paste this into a new chat as context. It records what is deployed on the Linode
server, what was changed to get there, and what is still pending.

---

## 1. Server

- **Host:** Linode compute instance, `104.64.206.82`, Ubuntu 24.04
- **SSH:** `ssh -i id_ed25519_digiprima digiprima@104.64.206.82` (run from Windows PowerShell, not from inside an SSH session)
- **Repo path:** `/var/www/html/uniform-coordination`
- **Disk:** ~17 GB free of 49 GB

**Working style:** the user runs all server commands over SSH himself and pastes the
output back. Do not inspect the local dev machine to infer server state. Give
copy-pasteable command blocks, one step at a time — he prefers short single commands
over long combined blocks.

---

## 2. Firewall — important constraint

**Linode Cloud Firewall allows only TCP 22, 80, 443, 7002, 7003 inbound.**
Ports 7000, 7001, 8005, 8006 are dropped *upstream*, before reaching the machine.

Proven with `sudo timeout 30 tcpdump -ni any 'tcp port 8005 and tcp[tcpflags] & tcp-syn != 0'`
→ `0 packets captured` while ufw allowed the port, the service was listening, and
`curl` from inside the server returned 200. Same result for port 7000.

Server-side is fully open — nothing left to fix there:
- `ufw` allows 22, 80, 443, 7000, 7001, 7002, 7003, 8005
- `/etc/default/ufw` → `DEFAULT_FORWARD_POLICY="ACCEPT"` (needed for Docker published ports; `ufw reload` flushes Docker's iptables rules, so `sudo systemctl restart docker` is required after)

**Only the Linode account owner (Dheeraj) can open the remaining ports.** Nobody on
the dev side has Linode Cloud Manager access. Alternatively a Linode API token would
let it be done over SSH via `https://api.linode.com/v4/networking/firewalls`.

Because of this, **everything is served through nginx on port 80.**

---

## 3. What runs where

### Backends (docker compose, one project per directory)

| | UniformBackend | table-backend |
|---|---|---|
| Dir | `UniformBackend/` | `table-backend/` |
| Containers | `uniform-backend`, `uniform-mysql`, `uniform-adminer` | `table-backend`, `table-mysql` |
| App port | 8005 | 8006 |
| DB | `uniform_db` / `uniformuser` / `uniformpass` | `table_db` / `tableuser` / `tablepass` |
| MySQL root | `root123` | `root123` |
| MySQL host bind | `127.0.0.1:3307` | `127.0.0.1:3308` |
| Volume | `uniformbackend_mysql_data` | `table-backend_mysql_data` |
| Server | Django `runserver`, `DEBUG=True` | Django `runserver`, `DEBUG=True` |

`uniform-adminer` runs on 8080 (blocked externally by Linode, which is fine — it is
an unauthenticated DB UI).

### Frontends (pm2, Next.js — NOT systemd)

| pm2 name | Port | Directory |
|---|---|---|
| `uniform-kireiz` | 7000 | `uniform-kireiz-coordination/` |
| `table-kireiz` | 7001 | `table-kireiz-coordination/` |
| `admin-kireiz` | 7002 | `admin-kireiz-coordination/` |
| `admin-table` | 7003 | `admin-table-coordination/` |

Ports come from each `package.json` `start` script (`next start -p 70xx`), not from
pm2 env — `pm2 jlist` shows `PORT: None`.

---

## 4. nginx routing (`/etc/nginx/sites-available/uniform`)

Enabled as `/etc/nginx/sites-enabled/uniform`; the stock `default` site was removed.
Shared proxy headers live in `/etc/nginx/proxy_common.conf`.
Per-app hostnames use **sslip.io** wildcard DNS (no DNS setup needed — any
`<label>.104.64.206.82.sslip.io` resolves to the IP).

| URL | Target |
|---|---|
| `http://104.64.206.82/` | uniform frontend (7000) |
| `http://104.64.206.82/api/`, `/admin/`, `/media/`, `/static/` | uniform backend (8005) |
| `http://table.104.64.206.82.sslip.io/` | table frontend (7001) |
| `http://table.104.64.206.82.sslip.io/api/`, `/admin/`, `/media/`, `/static/` | table backend (8006) |
| `http://admin.104.64.206.82.sslip.io/` | admin-kireiz (7002) |
| `http://admintable.104.64.206.82.sslip.io/` | admin-table (7003) |

Ports 7002 and 7003 also work directly (`http://104.64.206.82:7002`).

`client_max_body_size 150M` is set to match Django's 150 MB upload limit.

### API path difference between the two backends

- UniformBackend: `/api/v1/uniformAdmin/...`, `/api/v1/userhub/...`
- table-backend: `/api/v1/space/uniformAdmin/...`, `/api/v1/space/userhub/...` (note the `space` segment)

Swagger for both: `/api/docs/swagger/` (not `/api/schema/swagger-ui/`).

---

## 5. Databases

Both DBs were imported from MySQL Workbench folder dumps (one `.sql` per table):

- `uniform_db` — from `Dump20260731.zip`, 66 tables
- `table_db` — from `Dump20260801_tabledb.zip`, 57 tables

Import method that worked:

```bash
docker exec -i <mysql-container> mysql -uroot -proot123 -e \
  "DROP DATABASE <db>; CREATE DATABASE <db> CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

cd ~/<dump-folder>
{ echo "SET FOREIGN_KEY_CHECKS=0; SET UNIQUE_CHECKS=0;"; cat *.sql; } \
  | docker exec -i <mysql-container> mysql -uroot -proot123 <db>
```

Notes:
- `docker exec -i` (not `-it`) — stdin redirect fails with `-t`
- `FOREIGN_KEY_CHECKS=0` is required because per-table files import alphabetically
- Stop the backend container first. If it is crash-looping it re-runs `migrate`
  repeatedly, gets killed mid-migration, and leaves half-created tables → the
  misleading error `(1050, "Table 'django_admin_log' already exists")`
- The dumps include `django_migrations` rows, so no `migrate --fake` was needed

---

## 6. Code changes made (all committed and pushed to `master`)

| File | Change | Why |
|---|---|---|
| `UniformBackend/requirements.txt` | added `weasyprint==62.3` | `userhub/pdf.py:12` imports it; missing → whole Django boot failed |
| `UniformBackend/Dockerfile` | added `libpango-1.0-0`, `libpangoft2-1.0-0`, `libharfbuzz0b`, `libcairo2`, `libgdk-pixbuf-2.0-0`, `libffi8`, `shared-mime-info`, `fonts-liberation` | weasyprint needs these system libs; pip install alone is not enough on `python:3.12-slim` |
| `table-backend/Dockerfile` | created (did not exist) | same libs, `EXPOSE 8006` |
| `table-backend/docker-compose.yml` | created (did not exist) | mysql + backend, ports 8006 / 127.0.0.1:3308, `env_file: .env` |
| `table-backend/.dockerignore` | created | — |
| both `UniformWeb/settings.py` | added server origins to `CORS_ALLOWED_ORIGINS` | CORS errors from the new hostnames |

CORS origins added to **both** backends (a backend validates the origin of whoever
calls it, so both need the full list):

```
http://104.64.206.82
http://104.64.206.82:7002
http://104.64.206.82:7003
http://table.104.64.206.82.sslip.io
http://admin.104.64.206.82.sslip.io
http://admintable.104.64.206.82.sslip.io
```

`CORS_ALLOW_CREDENTIALS = True` is set, so `CORS_ALLOW_ALL_ORIGINS` cannot be used —
every origin must be listed explicitly.

### Server-only changes (NOT in the repo)

- `UniformBackend/docker-compose.yml` on the server: MySQL published port changed from
  `"3306:3306"` to `"127.0.0.1:3307:3306"`, because the host already has something on
  3306. **This is not in git — the next `git pull`/`checkout` will wipe it and MySQL
  will fail to start with `address already in use`.** Should be pushed.
- `table-backend/.env` — contains `OPENAI_API_KEY`. Gitignored, server-only.
  Must be owned by `digiprima` (not root), otherwise every `docker compose`
  command fails with `open ...: permission denied`.

---

## 7. Status & Completed Work (as of 2026-09-25)

1. **Host:** New instance at `172.237.71.124` (replaces decommissioned `104.64.206.82`).
2. **Backends:**
   - Both `UniformBackend` (port 8005) and `table-backend` (port 8006) running on Gunicorn with 3 workers.
   - `DEBUG=False` enforced by default across both Django projects.
   - Non-root `appuser` enforced inside Docker containers; host binds restricted to `127.0.0.1`.
   - Lazy OpenAI client initialization implemented to prevent missing key startup crashes.
3. **Memory & Swap:**
   - 4GB swap space zero-filled with `dd` (`/swapfile2`), 4.5GB total swap, persisted in `/etc/fstab`.
4. **Frontends (all 4 built and online via PM2):**
   - `uniform-kireiz` (port 7000): 48 pages built. Accessible at `http://172.237.71.124/`.
   - `table-kireiz` (port 7001): 60 pages built. Accessible at `http://table.172.237.71.124.sslip.io/`.
   - `admin-kireiz` (port 7002): 107 pages built. Accessible at `http://admin.172.237.71.124.sslip.io/`.
   - `admin-table` (port 7003): 122 pages built. Accessible at `http://admintable.172.237.71.124.sslip.io/`.
   - All 4 frontends registered with PM2 and configured for automatic resurrection on boot via `systemd` (`pm2-digiprima.service`).
5. **Nginx Routing:**
   - `/etc/nginx/sites-available/uniform` configures all 4 virtual hosts with WebSocket support and proxies API/admin/static/media paths to respective backends.
6. **Dynamic Host & Verification Links:**
   - Updated email verification and forgot password links in `UniformBackend/userhub/views.py`, `table-backend/userhub/views.py`, and `uniformAdmin/auth.py` to use dynamic `request.get_host()` and `scheme` instead of hardcoded `uniform.dxtspace.com` or `table.dxtspace.com`.
7. **User Roles:**
   - Updated `Users.save()` in both backends: uniform defaults to `b2b`, table defaults to `b2c`. Existing users migrated.
8. **Simulation Assets & Public Endpoints:**
   - Imported `simulation_assets.py` and `simulation_public.py` into `UniformBackend/uniformAdmin/urls.py` and registered routes for `simulation-assets/`, `simulation-assets/structure/`, `simulation/options/`, `simulation/product/<id>/layers/`, and `simulation/categories/`.

---

## 8. Gotchas hit along the way (so they are not re-debugged)

- **`Bus error (core dumped)` during Next.js build:**
  Triggered when Next.js attempts to load `@next/swc-linux-x64-musl` whose ELF header specifies a mapping past the file's physical size (`BUS_ADRERR`).
  Fix: Install `@next/swc-wasm-nodejs` and `rm -rf node_modules/@next/swc-linux-*`. Next.js falls back to WASM cleanly.
- **Node out-of-memory during Next.js page generation:**
  Default Node heap limit is ~1GB. Large apps require `NODE_OPTIONS="--max-old-space-size=3072"` or `3584`.
- **Swap creation requires `dd` not `fallocate`:**
  `fallocate` creates unwritten block extents (sparse holes). Linux kernel triggers `SIGBUS` when swapping pages into unwritten extents. Always use `dd if=/dev/zero of=/swapfile ...`.
- `docker compose logs -f` prints the **entire** history first — old crashes reappear
  and look like new errors. Use `--since 60s` or `--tail=N`.
- `docker compose down` did nothing at first: the running containers had been created
  by a different deploy (a `ghcr.io/...` image via CI), so the local compose file did
  not own them. `docker rm -f <names>` was needed.
- `git stash` silently did nothing because the repo files were root-owned after a
  `sudo git pull`. Fix: `sudo chown -R digiprima:digiprima /var/www/html/uniform-coordination`
  and never run git with `sudo`.
- `table-backend/uniformAdmin/migrations/` and `userhub/migrations/` **do not exist**
  in the repo. So `migrate` only handles `admin, auth, contenttypes, sessions,
  token_blacklist` and fails with `(1824, "Failed to open the referenced table
  'uniformAdmin_adminuser'")` on an empty DB. The DB dump is what creates those
  tables. Do not run `makemigrations` casually — it would generate initial migrations
  that do not match the dumped schema.
- `staticfiles.W004` warning (`/app/static` does not exist) is harmless.
