import type { IFileRepository } from "../repositories/file.repository.interface"
import type { FileDto } from "@windows-explorer/shared"

/**
 * File service — orchestrates file-related business logic.
 */
export class FileService {
  constructor(private readonly fileRepository: IFileRepository) {}

  /**
   * Returns all files within a folder.
   */
  async getFilesByFolder(folderId: string): Promise<FileDto[]> {
    return this.fileRepository.findByFolderId(folderId)
  }

  /**
   * Searches files by name (case-insensitive partial match).
   */
  async searchFiles(query: string): Promise<FileDto[]> {
    const trimmed = query.trim()
    if (trimmed.length === 0) {
      return []
    }
    return this.fileRepository.search(trimmed)
  }
}
