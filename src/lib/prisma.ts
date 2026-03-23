import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    // Return a proxy that throws on actual usage, allowing build-time imports to succeed
    return new Proxy({} as PrismaClient, {
      get(_, prop) {
        if (prop === "then" || typeof prop === "symbol") return undefined;
        throw new Error("DATABASE_URL environment variable is not set");
      },
    });
  }

  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
}

export function getPrisma() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}
