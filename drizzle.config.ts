import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    database: "postgres",
    user: "postgres.nydoiezsepvcautphznl",
    password: "m11vzDqLhBX4QeEm",
    host: "aws-1-ap-south-1.pooler.supabase.com",
    port: 5432,
    // ssl: true,
    // url: "postgresql://postgres.nydoiezsepvcautphznl:m11vzDqLhBX4QeEm@aws-1-ap-south-1.pooler.supabase.com:6543/postgres",
  },

  // This prevents Drizzle from trying to 'read' Supabase system schemas
  // schemaFilter: ["public"],
});
