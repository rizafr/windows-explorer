import Elysia, { t } from "elysia"
import type { FolderService } from "../../../application/services/folder.service"
import type { FileService } from "../../../application/services/file.service"

/**
 * Search router — GET /api/v1/search
 * Searches both folders and files simultaneously.
 */
export const searchRoutes = (
  folderService: FolderService,
  fileService: FileService
) =>
  new Elysia({ prefix: "/search" }).get(
    "/",
    async ({ query }) => {
      const q = query.q?.trim() ?? ""

      if (q.length === 0) {
        return {
          data: { folders: [], files: [] },
          meta: { total: 0, query: q },
        }
      }

      // Run both searches in parallel
      const [folders, files] = await Promise.all([
        folderService.searchFolders(q),
        fileService.searchFiles(q),
      ])

      return {
        data: { folders, files },
        meta: {
          total: folders.length + files.length,
          query: q,
        },
      }
    },
    {
      query: t.Object({
        q: t.Optional(t.String({ minLength: 0, maxLength: 200 })),
        type: t.Optional(
          t.Union([t.Literal("folder"), t.Literal("file"), t.Literal("all")])
        ),
      }),
      detail: {
        tags: ["Search"],
        summary: "Search folders and files",
        description:
          "Case-insensitive partial-match search across all folder and file names.",
      },
    }
  )
