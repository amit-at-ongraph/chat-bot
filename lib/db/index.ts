import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  "postgresql://postgres.nydoiezsepvcautphznl:m11vzDqLhBX4QeEm@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";

// Disable prefetch as it is not supported for "Transaction" mode
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema, logger: true });
