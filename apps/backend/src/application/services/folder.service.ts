import type { IFolderRepository } from "../repositories/folder.repository.interface"
import type { FolderDto, FolderChildDto } from "@windows-explorer/shared"

/**
 * Folder service — orchestrates business logic.
 * Depends only on the IFolderRepository interface (never on Drizzle directly).
 */
export class FolderService {
  constructor(private readonly folderRepository: IFolderRepository) {}

  /**
   * Returns the complete folder tree as a flat list.
   * The client is responsible for building the nested tree structure — O(n).
   */
  async getFolderTree(): Promise<FolderDto[]> {
    return this.folderRepository.findAll()
  }

  /**
   * Returns the direct children of a folder.
   * Validates that the folder exists before querying children.
   */
  async getFolderChildren(folderId: string): Promise<FolderChildDto[]> {
    const exists = await this.folderRepository.exists(folderId)
    if (!exists) {
      throw new FolderNotFoundError(folderId)
    }
    return this.folderRepository.findChildren(folderId)
  }

  /**
   * Returns root-level folders (for an alternative "roots only" endpoint).
   */
  async getRootFolders(): Promise<FolderChildDto[]> {
    return this.folderRepository.findRoots()
  }

  /**
   * Searches folders by name (case-insensitive partial match).
   */
  async searchFolders(query: string): Promise<FolderDto[]> {
    const trimmed = query.trim()
    if (trimmed.length === 0) {
      return []
    }
    return this.folderRepository.search(trimmed)
  }
}

// ─── Domain errors ────────────────────────────────────────────────────────────

export class FolderNotFoundError extends Error {
  public readonly folderId: string

  constructor(folderId: string) {
    super(`Folder with id "${folderId}" was not found`)
    this.name = "FolderNotFoundError"
    this.folderId = folderId
  }
}
