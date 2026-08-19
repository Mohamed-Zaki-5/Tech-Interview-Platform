# Technical Interview Platform

This repository keeps the platform's independently developed applications in explicit workspaces while sharing product and architecture documentation at the repository root.

## Repository layout

- [`backend/`](./backend/) contains the Node.js, Express, PostgreSQL, and Prisma modular monolith. See [`backend/README.md`](./backend/README.md) for setup and verification commands.
- [`frontend/`](./frontend/) is reserved for the separately maintained React application. See [`frontend/README.md`](./frontend/README.md).
- [`docs/`](./docs/) contains shared architecture, database, API, ADR, and agent documentation.
- [`CONTEXT.md`](./CONTEXT.md) defines the shared project glossary and domain language.

There is intentionally no root npm workspace configuration. Run backend npm and Prisma commands from `backend/`; the frontend collaborator may choose the frontend package setup independently.
