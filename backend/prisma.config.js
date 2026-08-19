import "dotenv/config";

import { defineConfig } from "prisma/config";

// Schema-only commands need a provider URL even when they do not connect. Runtime startup
// independently requires and validates DATABASE_URL through the application configuration.
const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://prisma_cli:prisma_cli@127.0.0.1:5432/tech_interview_platform";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: { url: databaseUrl },
});
