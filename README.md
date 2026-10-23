# StudyZen

StudyZen is a self-hosted study platform for planning work, tracking focus sessions, and reviewing progress. The stack includes a React web app, a Spring Boot API, and PostgreSQL.

## Features

- Pomodoro, countdown, and focus timers with session notes and ratings
- Subjects, topics, academic terms, assessments, and grades
- Daily and weekly planning, scheduled study sessions, deadlines, and to-dos
- Study statistics, activity history, and progress summaries
- Account settings, theme customization, and configurable timer sounds

## Run with Docker Compose

### Requirements

- Docker Desktop or Docker Engine with the Compose plugin

### Start

1. Create a local environment file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env`: set database credentials, replace `JWT_SECRET` with a unique random secret of at least 32 bytes, and set `COOKIE_SECURE=false` only for local HTTP development. For HTTPS hosting, set `COOKIE_SECURE=true`. Keep `.env` private and never commit real credentials. Generate a secret with `openssl rand -base64 32` or `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.

3. Build and start the services:

   ```bash
   docker compose up -d --build
   ```

4. Open the web app at <http://localhost:7777>.

The frontend proxies API and authentication routes to the backend over the Compose network. The backend is also exposed directly at <http://localhost:8082/api> for local development. PostgreSQL listens on port 5432 inside the Compose network and stores data in the persistent `postgres_data` volume. When hosting behind Nginx Proxy Manager with HTTPS, use `COOKIE_SECURE=true` and keep the HTTP origin ports reachable only within the trusted homelab network; browser traffic should use the HTTPS domains.

To inspect service logs, run `docker compose logs -f`. To stop the services while keeping database data, run `docker compose down`. **`docker compose down -v` deletes the database volume and its data.**

### Environment configuration

The root `.env.example` configures the full Compose stack. Important settings:

| Variable | Default / purpose |
|---|---|
| `DB_NAME`, `DB_USER`, `DB_PASSWORD` | PostgreSQL database and credentials; choose a strong password. |
| `JWT_SECRET` | Required. Replace the placeholder with a unique random value of at least 32 characters. |
| `FRONTEND_PORT` | Host port for the web app (`7777`). |
| `BACKEND_PUBLIC_PORT` | Host port for the backend API (`8082`). |
| `BACKEND_PRIVATE_PORT` | Backend container port (`8080`). |
| `FRONTEND_URL`, `CORS_ALLOWED_ORIGIN` | Frontend origin (`http://localhost:7777`); update together when hosting at another origin. |
| `COOKIE_SECURE` | Set `true` when serving over HTTPS, including behind a TLS-terminating reverse proxy; use `false` only for local HTTP development. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Optional Google sign-in credentials. Configure valid OAuth credentials and callback URLs before enabling Google sign-in. |
| `SMTP_*` | Optional mail delivery settings for account verification and recovery flows. |
| `JWT_ACCESS_EXPIRY_MS`, `JWT_REFRESH_EXPIRY_MS` | Optional token lifetimes in milliseconds; defaults are 900000 and 604800000. |
| `VITE_API_BASE_URL`, `VITE_BACKEND_URL` | Frontend build settings. Compose defaults to `/api` and an empty backend URL so Nginx proxies internally. Do not put secrets in `VITE_*` values; they are included in the frontend build. |

The root example includes the full list of settings and safe placeholders. Keep secret values on the backend and outside source control.

## Development

### Web frontend

Use Node.js and npm. From `frontend-web/`:

```bash
npm install
npm run dev
```

The Vite server defaults to <http://localhost:7777>. Its `.env.example` is for standalone frontend development and points to the backend on `localhost:8082` by default. The Vite development server proxies `/api`, `/oauth2`, and `/login/oauth2` to the backend. To use a different backend address, set `VITE_BACKEND_URL` in a local, uncommitted `frontend-web/.env` file.

To validate or build the frontend:

```bash
npm run lint
npm run build
```

### Backend

The backend uses Java 21 and Maven. With PostgreSQL available and the required database/JWT environment variables set, run from the repository root:

```bash
mvn -pl backend -am spring-boot:run
```

## Backend-only package

For instructions on running the separately packaged backend with an independently hosted frontend, see [README-backend.md](README-backend.md).

## Project layout

```text
StudyZen/
├── backend/          # Spring Boot API, database migrations, and backend services
├── frontend-web/     # React, TypeScript, Vite, and Tailwind CSS web app
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── README.md
```

## License

StudyZen is licensed under the MIT License. See [LICENSE](LICENSE).
