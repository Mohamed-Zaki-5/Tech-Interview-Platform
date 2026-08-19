# Technical Interview Platform Backend

This workspace contains the Phase 1 backend and database foundation for the Technical Interview Platform. It is a JavaScript ESM modular monolith built with Node.js, Express, PostgreSQL, and Prisma. Run the commands below from this `backend/` directory.

## Requirements

- Node.js 24.19.0 (the supported production runtime; see `.nvmrc`)
- npm 11
- PostgreSQL for migration application and readiness checks

## Local setup

```sh
npm install
cp .env.example .env
```

Replace every `REPLACE_...` value in `.env`, create the configured PostgreSQL database, then run:

```sh
npm run prisma:generate
npm run prisma:migrate:dev
npm run dev:api
```

Run the Phase 1 worker in a separate terminal:

```sh
npm run dev:worker
```

The worker intentionally has no Evaluation Job processor in Phase 1 and logs that state at startup.

## Verification

```sh
npm run format:check
npm run lint
npm run typecheck
npm test
npm run coverage
npm run prisma:format
npm run prisma:validate
npm run prisma:generate
```

## Phase 1 architecture

- `src/api` composes the Express application separately from the HTTP listener.
- `src/worker` is a distinct process role in the same deployment artifact.
- `src/modules` defines the domain ownership boundaries; domain endpoints are intentionally deferred.
- `src/platform` owns configuration, HTTP, logging, lifecycle, and database adapters.
- REST composition is reserved under `/api/v1`.
- `/health/live` reports process liveness; `/health/ready` verifies PostgreSQL through the database adapter.
- Public errors use safe RFC 9457-style `application/problem+json` responses with correlation IDs.
- Results and progress are derived from immutable snapshots, Answers, and active Evaluations; there is no Result or mutable Progress table.
- Asynchronous evaluation is modeled as a leased PostgreSQL queue. No Redis or external broker is used.

Phase 1 does not implement authentication, catalog management, assessment workflows, evaluators, results, progress, seed Questions, or an AI provider.
