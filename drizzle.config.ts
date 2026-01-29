import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://postgres:m11vzDqLhBX4QeEm@db.nydoiezsepvcautphznl.supabase.co:5432/postgres",
  },
  // This prevents Drizzle from trying to 'read' Supabase system schemas
  schemaFilter: ["public"],
});
