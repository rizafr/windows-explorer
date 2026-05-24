import Elysia, { t } from "elysia"
import type { FolderService } from "../../../application/services/folder.service"
import type { FileService } from "../../../application/services/file.service"
import { FolderNotFoundError } from "../../../application/services/folder.service"

/**
 * Folders router — all routes are prefixed with /api/v1/folders by the parent app.
 */
export const foldersRoutes = (
  folderService: FolderService,
  fileService: FileService
) =>
  new Elysia({ prefix: "/folders" })
    /**
     * GET /api/v1/folders
     * Returns the complete flat folder list. Frontend builds the tree O(n).
     */
    .get(
      "/",
      async () => {
        const data = await folderService.getFolderTree()
        return { data }
      },
      {
        detail: {
          tags: ["Folders"],
          summary: "Get full folder tree (flat list)",
          description:
            "Returns all folders as a flat array with parentId references. Build the tree client-side for efficiency.",
        },
      }
    )

    /**
     * GET /api/v1/folders/root
     * Returns only root-level folders (parentId IS NULL).
     */
    .get(
      "/root",
      async () => {
        const data = await folderService.getRootFolders()
        return { data }
      },
      {
        detail: {
          tags: ["Folders"],
          summary: "Get root folders",
        },
      }
    )

    /**
     * GET /api/v1/folders/:id/children
     * Returns direct children (folders + files) of the given folder.
     */
    .get(
      "/:id/children",
      async ({ params, set }) => {
        try {
          const [childFolders, childFiles] = await Promise.all([
            folderService.getFolderChildren(params.id),
            fileService.getFilesByFolder(params.id),
          ])

          return {
            data: {
              folders: childFolders,
              files: childFiles,
            },
          }
        } catch (err) {
          if (err instanceof FolderNotFoundError) {
            set.status = 404
            return {
              error: {
                code: "FOLDER_NOT_FOUND",
                message: err.message,
                statusCode: 404,
              },
            }
          }
          throw err
        }
      },
      {
        params: t.Object({ id: t.String({ format: "uuid" }) }),
        detail: {
          tags: ["Folders"],
          summary: "Get direct children of a folder",
          description:
            "Returns all direct child folders and files of the specified folder.",
        },
      }
    )
