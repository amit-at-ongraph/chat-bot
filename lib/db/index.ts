import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

// Disable prefetch as it is not supported for "Transaction" mode
export const client = postgres(connectionString, { prepare: false, max: 1 });
export const db = drizzle(client, { schema, logger: false });
