import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required")
}

// Connection pool — postgres-js handles pooling internally.
// max: 10 is a sane default; tune per environment.
const queryClient = postgres(connectionString, {
  max: 10,
  idle_timeout: 30,
  connect_timeout: 10,
})

export const db = drizzle(queryClient, { schema, logger: process.env.NODE_ENV === "development" })

export type Database = typeof db
