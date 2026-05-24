# Windows Explorer

A full-stack Windows Explorer-like web application built as a Bun monorepo. The app presents a folder tree, a resizable explorer layout, folder/file contents, and search across folders and files.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Runtime and package manager | Bun |
| Backend | Elysia, TypeScript |
| Database | PostgreSQL, Drizzle ORM |
| Frontend | Vue 3, Composition API, Pinia, Vite |
| Shared contracts | TypeScript workspace package |
| Testing | Bun test, Vitest, Playwright |
| Local services | Docker Compose |

## Project Structure

```text
.
├── apps
│   ├── backend
│   │   ├── src/app.ts                    # Elysia app composition
│   │   ├── src/index.ts                  # Backend server entrypoint
│   │   ├── src/application               # Services and repository interfaces
│   │   ├── src/infrastructure            # Database, migrations, repositories
│   │   ├── src/presentation/http/v1      # HTTP routes
│   │   └── tests                         # Backend unit and integration tests
│   └── frontend
│       ├── src/app                       # App shell and layout
│       ├── src/features                  # Explorer, folder tree, search, contents
│       ├── src/shared                    # API client and shared UI components
│       └── src/tests                     # Frontend and E2E tests
├── packages/shared                       # Shared DTO and API response types
├── docker-compose.yml                    # Local PostgreSQL
├── .env.example                          # Environment template
└── package.json                          # Root workspace scripts
```

## Prerequisites

- Bun 1.3 or newer
- Docker and Docker Compose
- PostgreSQL client tools are optional; the app uses Docker Compose for local PostgreSQL

## Environment Setup

Create a local `.env` file from the template:

```bash
cp .env.example .env
```

The root scripts load `.env` explicitly with `--env-file=.env`. Use the same filename for development and production, and change the values inside the file for the target environment.

Important variables:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Backend and Drizzle PostgreSQL connection string |
| `POSTGRES_*` | Docker Compose PostgreSQL configuration |
| `BACKEND_HOST` | Elysia listen host |
| `BACKEND_PORT` | Elysia listen port |
| `FRONTEND_URL` | Allowed CORS origin for the backend |
| `VITE_API_BASE_URL` | Frontend API base URL |

The real `.env` file is ignored by Git. Commit changes to `.env.example` when the required variable list changes.

## Install

Install workspace dependencies from the repository root:

```bash
bun install
```

Start the local database:

```bash
docker compose up -d
```

Run migrations and seed data:

```bash
bun run db:migrate
bun run db:seed
```

## Development

Start backend and frontend together:

```bash
bun run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- Health check: `http://localhost:3001/health`
- Swagger docs: `http://localhost:3001/docs`

You can also run each app directly:

```bash
bun run --cwd apps/backend dev
bun run --cwd apps/frontend dev
```

When running app-level scripts directly, make sure the required environment variables are available. Root scripts already load `.env`.

## Database

Generate migrations after schema changes:

```bash
bun run --cwd apps/backend db:generate
```

Apply migrations:

```bash
bun run db:migrate
```

Seed the sample Windows Explorer data:

```bash
bun run db:seed
```

Open Drizzle Studio:

```bash
bun run db:studio
```

## Testing

Run all workspace tests:

```bash
bun run test
```

Run backend tests:

```bash
bun run --env-file=.env --cwd apps/backend test
```

Backend integration tests use the real database. Make sure PostgreSQL is running, migrations have been applied, and seed data exists before running them.

Run frontend unit tests:

```bash
bun run --cwd apps/frontend test
```

Run frontend type checks:

```bash
bun run --cwd apps/frontend typecheck
```

Run E2E tests:

```bash
bun run dev
bun run test:e2e
```

The Playwright tests target `http://localhost:5173`. The frontend expects the backend API to be available through the Vite `/api` proxy.

If Playwright reports that the browser executable is missing, install the local browser binary:

```bash
bun run playwright:install
```

## Build

Build all apps:

```bash
bun run build
```

Build only the frontend:

```bash
bun run --cwd apps/frontend build
```

The backend runs TypeScript directly with Bun; its Docker image starts `apps/backend/src/index.ts`.

## API

Base path: `/api/v1`

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Backend health check |
| `GET` | `/api/v1/folders` | Return all folders as a flat tree list |
| `GET` | `/api/v1/folders/root` | Return root-level folders |
| `GET` | `/api/v1/folders/:id/children` | Return direct child folders and files |
| `GET` | `/api/v1/search?q=term` | Search folders and files |

Swagger documentation is exposed at `/docs` when the backend is running.

## Architecture

The backend follows a layered structure:

- Presentation: Elysia route modules under `presentation/http/v1`
- Application: business services and repository interfaces
- Infrastructure: Drizzle database client, schema, migrations, and repository implementations
- Composition root: `src/app.ts` wires repositories, services, routes, CORS, Swagger, and error handling
- Runtime entrypoint: `src/index.ts` calls `app.listen`

The frontend is organized by feature:

- `app`: application shell and layout
- `features/folder-tree`: tree navigation and expansion state
- `features/folder-contents`: right-panel folder and file listings
- `features/search`: search UI and search composable
- `features/explorer`: Pinia store for selected folder and explorer state
- `shared`: API client and reusable UI components

Shared DTOs live in `packages/shared` so the frontend and backend can agree on API response shapes.

## Production Notes

Production uses the same `.env` filename. Set production values in the deployment environment or in the deployed `.env` file:

- Use a production `DATABASE_URL`
- Set `NODE_ENV=production`
- Set `BACKEND_HOST=0.0.0.0` when running inside a container
- Set `FRONTEND_URL` to the deployed frontend origin
- Set `VITE_API_BASE_URL` to the deployed API path or URL

The repository includes Dockerfiles for the backend and frontend. The current `docker-compose.yml` is focused on local PostgreSQL.
