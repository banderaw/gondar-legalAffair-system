---
name: testing-gondar-legal
description: How to bring up the Gondar Legal Affair system locally with Docker and test login / dashboard flows end-to-end through the UI.
---

# Local bring-up and UI testing (Gondar Legal Affair system)

## Bring up the full stack
```bash
cd <repo root>
cp .env.example .env          # POSTGRES_DB/USER/PASSWORD, SECRET_KEY etc.
docker compose up -d --build  # db (5432), backend gunicorn (8000), frontend nginx (80)
```
- Frontend is served by nginx at http://localhost and proxies `/api/` and `/media/` to `backend:8000` (`frontend/nginx.conf`). Build the `frontend` service explicitly if you only started `backend`.
- `backend/entrypoint.sh` waits for Postgres with `psql` using `$DB_USER/$DB_PASSWORD/$DB_NAME/$DB_HOST`, then runs `manage.py migrate`, then gunicorn. If those `DB_*` vars are missing from the backend service env in `docker-compose.yml`, the wait-loop spins forever printing "PostgreSQL is unavailable - sleeping" and the app never starts — a good health check is:
  ```bash
  docker compose logs backend | grep -c "unavailable - sleeping"   # expect 0-3
  docker compose logs backend | grep -E "PostgreSQL is ready|Starting Gunicorn"
  ```
- A clean-boot test requires `docker compose down -v` (drops the postgres volume) so the entrypoint genuinely waits on a cold DB. Note this also deletes any test users you created.

## Create a test user
The dashboard is role-gated (`frontend/src/pages/Dashboard.jsx` switches on `user.role`; unknown/blank role renders literally "Unknown role"). Give the user a real role, e.g. `admin`:
```bash
docker compose exec -T backend python manage.py shell -c "
from django.contrib.auth import get_user_model
U=get_user_model()
u,_=U.objects.get_or_create(username='logintest', defaults={'email':'logintest@example.com','role':'admin'})
u.role='admin'; u.is_active=True; u.set_password('TestPass123!'); u.save()
"
```
Valid roles: `admin`, `head`, `legal_officer`, `reporter`.

## UI login flow
- Go to http://localhost/login, fill `#username` / `#password`, click "Sign in".
- `AuthContext.login()` POSTs `/api/auth/login/`, stores accessToken/refreshToken/userData in localStorage, then `navigate('/dashboard')`.
- Success looks like: URL `/dashboard`, left nav (Dashboard/Cases/Documents/Hearings/Agreements/User Management/Settings) and role-specific dashboard cards.
- Typing quirk: after a failed submit the React form may need a fresh click into each input; verify field contents in a screenshot before clicking "Sign in".

## Known pre-existing bug worth knowing when testing login
Wrong credentials produce no visible error banner: the axios response interceptor (`frontend/src/api/axios.js`) treats the login 401 as an expired-token case, fails to refresh, and does `window.location.href = '/login'`, which reloads the page and discards the `Login.jsx` error state. So the negative-path assertion is only "stays on /login / never reaches dashboard", plus console error `Login error: Error: No refresh token available`. If a PR claims to fix login error messaging, check this interceptor first.

## Devin Secrets Needed
None — local `.env.example` values (e.g. `POSTGRES_PASSWORD=changeme`) are sufficient.
