import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

/** @param {{ url: string }} configuration */
export function createDatabase(configuration) {
  const adapter = new PrismaPg({ connectionString: configuration.url });
  const client = new PrismaClient({ adapter });

  return {
    client,

    async connect() {
      await client.$connect();
    },

    async disconnect() {
      await client.$disconnect();
    },

    async checkReadiness() {
      await client.$queryRaw`SELECT 1`;
    },
  };
}
