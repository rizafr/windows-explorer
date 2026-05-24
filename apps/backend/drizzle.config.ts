import { defineConfig } from "drizzle-kit"
import { normalizeDatabaseUrl } from "./src/infrastructure/db/connection-string"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required")
}

export default defineConfig({
  schema: "./src/infrastructure/db/schema.ts",
  out: "./src/infrastructure/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: normalizeDatabaseUrl(connectionString),
  },
  verbose: true,
  strict: true,
})
