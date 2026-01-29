import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://postgres.nydoiezsepvcautphznl:m11vzDqLhBX4QeEm@aws-1-ap-south-1.pooler.supabase.com:6543/postgres",
  },
  // This prevents Drizzle from trying to 'read' Supabase system schemas
  schemaFilter: ["public"],
});
