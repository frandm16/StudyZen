<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="images/header-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="images/header-light.png">
    <img alt="StudyZen" src="images/header-dark.png" width="100%">
  </picture>
</p>

# StudyZen

A self-hosted study platform for planning academic coursework, tracking focus sessions, and reviewing progress over time.

<p>
  <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-6366f1">
  <img alt="React 19" src="https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white">
  <img alt="Spring Boot 3" src="https://img.shields.io/badge/Spring%20Boot-3-6db33f?logo=springboot&logoColor=white">
  <img alt="PostgreSQL 16" src="https://img.shields.io/badge/PostgreSQL-16-4169e1?logo=postgresql&logoColor=white">
  <img alt="Docker Compose" src="https://img.shields.io/badge/Docker-Compose-2496ed?logo=docker&logoColor=white">
</p>

---

## Overview

StudyZen brings your personal study tools together in a single self-hosted web application:

- **Focus Timers**: Pomodoro, countdown, and stopwatch modes with configurable audio signals, session notes, and post-session concentration ratings.
- **Academic Hierarchy**: Organize work by terms, courses, modules, and topic checklists, with evaluation weights and recorded grades.
- **Unified Study Calendar**: Schedule study sessions, track exam deadlines, and plan daily goals across month, week, and day views with an integrated planning drawer.
- **Statistics and History**: Activity records, cumulative study hours, subject distribution charts, and daily focus trends over time.
- **Personalization**: Curated color palettes with real-time CSS variable bindings, dark and light modes, and customizable timer sounds.

## Screenshots

Timer, subjects, calendar, and stats, available in both dark and light mode.

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="images/Timer-Running-DarkMode.png">
    <source media="(prefers-color-scheme: light)" srcset="images/Timer-Running-LightMode.png">
    <img alt="StudyZen focus timer session" src="images/Timer-Running-DarkMode.png" width="49%">
  </picture>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="images/Subjects-DarkMode.png">
    <source media="(prefers-color-scheme: light)" srcset="images/Subjects-LightMode.png">
    <img alt="StudyZen subjects and topic hierarchy" src="images/Subjects-DarkMode.png" width="49%">
  </picture>
</p>
<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="images/Calendar-DarkMode.png">
    <source media="(prefers-color-scheme: light)" srcset="images/Calendar-LightMode.png">
    <img alt="StudyZen calendar and schedule planner" src="images/Calendar-DarkMode.png" width="49%">
  </picture>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="images/Stats-DarkMode.png">
    <source media="(prefers-color-scheme: light)" srcset="images/Stats-LightMode.png">
    <img alt="StudyZen analytics and study stats" src="images/Stats-DarkMode.png" width="49%">
  </picture>
</p>

## Architecture

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS 4, Lucide Icons |
| **Backend** | Java 21, Spring Boot 3, Spring Security (JWT, OAuth2), Hibernate / JPA |
| **Database** | PostgreSQL 16, Flyway database migrations |
| **Orchestration** | Docker Compose, multi-stage Docker builds, Nginx reverse proxy |

## Quickstart with Docker Compose

### Prerequisites

- Docker Desktop or Docker Engine with the Compose plugin

### Setup and Launch

1. Create a local environment file from the provided example:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` to configure your database password and generate a secure `JWT_SECRET` (minimum 32 characters):

   ```bash
   # Generate a 32-byte secret using OpenSSL:
   openssl rand -base64 32

   # Or using Node.js:
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

   For local HTTP development, keep `COOKIE_SECURE=false`. If serving over HTTPS through a reverse proxy, set `COOKIE_SECURE=true`.

3. Build and launch the containers in the background:

   ```bash
   docker compose up -d --build
   ```

4. Open the web interface at `http://localhost:7777`.

The frontend container proxies `/api` and authentication endpoints internally to the Spring Boot backend. The backend is also directly reachable at `http://localhost:8082/api`.

### Useful Commands

- Inspect service logs: `docker compose logs -f`
- Stop the stack without losing data: `docker compose down`
- Stop the stack and remove persistent data: `docker compose down -v`

## Environment Configuration

The root `.env.example` configures the entire stack. Key variables:

| Variable | Description | Default |
|---|---|---|
| `DB_NAME` | PostgreSQL database name | `studyzen` |
| `DB_USER` | PostgreSQL user account | `studyzen_user` |
| `DB_PASSWORD` | PostgreSQL password (choose a strong value) | `studyzen_secret` |
| `JWT_SECRET` | Required secret for signing authentication tokens | (placeholder) |
| `FRONTEND_PORT` | Exposed host port for the web frontend | `7777` |
| `BACKEND_PUBLIC_PORT` | Exposed host port for the backend API | `8082` |
| `BACKEND_PRIVATE_PORT` | Internal port used by the backend container | `8080` |
| `FRONTEND_URL` | Public origin of the web client | `http://localhost:7777` |
| `CORS_ALLOWED_ORIGIN` | Allowed origin for backend CORS requests | `http://localhost:7777` |
| `COOKIE_SECURE` | Set `true` when behind HTTPS; `false` for local HTTP | `false` |
| `GOOGLE_CLIENT_ID` | Optional Google OAuth2 client ID | (empty) |
| `GOOGLE_CLIENT_SECRET` | Optional Google OAuth2 client secret | (empty) |
| `SMTP_*` | Optional mail delivery configuration for password recovery | (empty) |
| `NOTIFICATION_CENTER_ENABLED` | Master switch for per-user NotificationCenter integrations | `false` |
| `VITE_API_BASE_URL` | Frontend API path prefix (proxied by Nginx) | `/api` |

Never commit the `.env` file with production secrets to version control.

## Local Development

> **Note:** the Vite dev server uses port `7777`, the same port as the Docker frontend. Stop the Docker stack (`docker compose down`) before running both.

### Frontend (`frontend-web/`)

Requirements: Node.js 20+ and npm.

```bash
cd frontend-web
npm install
npm run dev
```

The Vite development server runs at `http://localhost:7777` and proxies backend requests to `http://localhost:8082` by default.

To run lint checks and build the production bundle:

```bash
npm run lint
npm run build
```

### Backend (`backend/`)

Requirements: Java 21 JDK and Maven.

Ensure a PostgreSQL instance is running with the credentials specified in your environment, then start the application from the repository root:

```bash
mvn -pl backend -am spring-boot:run
```

For standalone backend container deployments, refer to [README-backend.md](README-backend.md).

## Project Structure

```text
StudyZen/
├── backend/
│   ├── src/main/java/com/studyzen/      # Controllers, services, models, security
│   ├── src/main/resources/db/migration/ # Flyway database migration scripts
│   └── pom.xml                          # Maven build configuration
├── frontend-web/
│   ├── src/components/                  # Modular React UI components
│   ├── src/pages/                       # Application pages and routing
│   ├── src/context/                     # Auth, Timer, Theme, and Toast state
│   ├── src/services/                    # HTTP client and API integration
│   └── package.json                     # Dependencies and scripts
├── images/                              # Application screenshots and assets
├── docker-compose.yml                   # Multi-service container orchestration
├── Dockerfile                           # Production container build definition
└── .env.example                         # Environment template
```

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.