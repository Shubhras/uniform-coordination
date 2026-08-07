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

## 7. Pending work

1. **Frontend `.env` — `NEXT_PUBLIC_API_BASE_URL` is wrong.** This is the main blocker.
   `src/configs/app.config.js` builds `apiPrefix = ${NEXT_PUBLIC_API_BASE_URL}/api`, and
   the code appends `/v1/...` after that. The env currently holds something like
   `http://104.64.206.82:8005/api/v1/uniformAdmin`, producing doubled paths:

   ```
   POST /api/v1/uniformAdmin/api/v1/userhub/login/   → 404   (what happens now)
   POST /api/v1/userhub/login/                       → 200   (correct)
   ```

   Correct values:
   - uniform frontend → `NEXT_PUBLIC_API_BASE_URL=http://104.64.206.82`
   - table frontend → `NEXT_PUBLIC_API_BASE_URL=http://table.104.64.206.82.sslip.io`

   **`NEXT_PUBLIC_*` vars are baked in at build time** — editing `.env` and running
   `pm2 restart` does nothing. Each app needs `npm run build` then `pm2 restart <name>`.

   Not yet inspected: the actual current `.env` contents of all four frontends.

2. **Push the server-only compose port fix** (`127.0.0.1:3307:3306`) to the repo.

3. **Linode firewall** — ask Dheeraj to allow TCP 7000, 7001, 8005, 8006
   (All IPv4 + All IPv6), same as the existing 7002–7003 rule.

4. **Celery / Redis** — UniformBackend logs `Celery Error: 'NoneType' object has no
   attribute 'Redis'`. `CELERY_BROKER_URL` points at `redis://127.0.0.1:6379/0`, but
   there is no Redis container and the `redis` python package is not installed.
   Background tasks (emails, PDFs) are dead. Requests are unaffected.

5. **`OPENAI_API_KEY`** — if a dummy value was used in `table-backend/.env`, AI
   endpoints will fail at call time. Also worth fixing in code:
   `table-backend/uniformAdmin/ai_views.py:13` does `client = OpenAI()` at module
   import, so a missing key crashes all of Django instead of just the AI feature.
   Should be made lazy.

6. **Production hardening (not started):** both backends run `runserver` with
   `DEBUG=True` and a hardcoded `SECRET_KEY`; DB passwords are plaintext in the
   committed compose files; SMTP credentials and DocuSign keys are hardcoded in
   `settings.py`. Gunicorn + real secret management is the eventual fix.

---

## 8. Gotchas hit along the way (so they are not re-debugged)

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
