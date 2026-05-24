import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { normalizeDatabaseUrl } from "./connection-string"
import * as schema from "./schema"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required")
}

const normalizedConnectionString = normalizeDatabaseUrl(connectionString)

// Connection pool — postgres-js handles pooling internally.
// max: 10 is a sane default; tune per environment.
const queryClient = postgres(normalizedConnectionString, {
  max: 10,
  idle_timeout: 30,
  connect_timeout: 10,
  onnotice: process.env.DB_LOG_QUERY === "true" ? console.log : () => {},
})

export const db = drizzle(queryClient, {
  schema,
  logger: process.env.DB_LOG_QUERY === "true",
})

export type Database = typeof db
