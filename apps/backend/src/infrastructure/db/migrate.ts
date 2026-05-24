import { migrate } from "drizzle-orm/postgres-js/migrator"
import { db } from "./client"
import { join } from "path"

async function runMigrations(): Promise<void> {
  console.log("🔄 Running database migrations...")

  await migrate(db, {
    migrationsFolder: join(import.meta.dir, "migrations"),
  })

  console.log("✅ Migrations completed successfully")
  process.exit(0)
}

runMigrations().catch((err) => {
  console.error("❌ Migration failed:", err)
  process.exit(1)
})
