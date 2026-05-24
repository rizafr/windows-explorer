import type { FileDto } from "@windows-explorer/shared"

/**
 * Port (interface) for file data access.
 */
export interface IFileRepository {
  /**
   * Returns all files belonging to a folder.
   */
  findByFolderId(folderId: string): Promise<FileDto[]>

  /**
   * Full-text search on file names (case-insensitive, partial match).
   */
  search(query: string): Promise<FileDto[]>
}
