import Elysia from "elysia"
import { cors } from "@elysiajs/cors"
import { swagger } from "@elysiajs/swagger"
import { db } from "./infrastructure/db/client"
import { DrizzleFolderRepository } from "./infrastructure/repositories/folder.repository"
import { DrizzleFileRepository } from "./infrastructure/repositories/file.repository"
import { FolderService } from "./application/services/folder.service"
import { FileService } from "./application/services/file.service"
import { foldersRoutes } from "./presentation/http/v1/folders.routes"
import { searchRoutes } from "./presentation/http/v1/search.routes"

/**
 * Compose the Elysia application.
 * All dependencies are wired here (poor-man's DI container).
 */
export function createApp() {
  // ── Infrastructure ──────────────────────────────────────────────────────────
  const folderRepository = new DrizzleFolderRepository(db)
  const fileRepository = new DrizzleFileRepository(db)

  // ── Application ─────────────────────────────────────────────────────────────
  const folderService = new FolderService(folderRepository)
  const fileService = new FileService(fileRepository)

  // ── Presentation ─────────────────────────────────────────────────────────────
  const app = new Elysia()
    .use(
      cors({
        origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
        methods: ["GET", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Accept"],
      })
    )
    .use(
      swagger({
        documentation: {
          info: {
            title: "Windows Explorer API",
            version: "1.0.0",
            description: "REST API for the Windows Explorer web application",
          },
          tags: [
            { name: "Folders", description: "Folder operations" },
            { name: "Search", description: "Search across folders and files" },
          ],
        },
        path: "/docs",
      })
    )
    // Global error handler
    .onError(({ error, set }) => {
      console.error("[API Error]", error)

      set.status = 500
      return {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
          statusCode: 500,
        },
      }
    })
    // Health check
    .get("/health", () => ({ status: "ok", timestamp: new Date().toISOString() }))
    // Versioned API routes
    .group("/api/v1", (app) =>
      app
        .use(foldersRoutes(folderService, fileService))
        .use(searchRoutes(folderService, fileService))
    )

  return app
}

export type App = ReturnType<typeof createApp>
