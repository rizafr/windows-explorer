import type { FolderDto, FolderChildDto } from "@windows-explorer/shared"

/**
 * Port (interface) for folder data access.
 * The application layer depends only on this interface — never on Drizzle directly.
 * This enables easy swapping of implementations and mocking in tests.
 */
export interface IFolderRepository {
  /**
   * Returns ALL folders as a flat list with parentId references.
   * The frontend builds the nested tree from this O(n) response.
   */
  findAll(): Promise<FolderDto[]>

  /**
   * Returns direct child folders of a given folder (one level deep).
   */
  findChildren(folderId: string): Promise<FolderChildDto[]>

  /**
   * Returns root-level folders (parentId IS NULL).
   */
  findRoots(): Promise<FolderChildDto[]>

  /**
   * Checks whether a folder exists.
   */
  exists(folderId: string): Promise<boolean>

  /**
   * Full-text search on folder names (case-insensitive, partial match).
   */
  search(query: string): Promise<FolderDto[]>
}
