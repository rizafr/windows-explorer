import { describe, it, expect, mock } from "bun:test"
import { FileService } from "../../src/application/services/file.service"
import type { IFileRepository } from "../../src/application/repositories/file.repository.interface"
import type { FileDto } from "@windows-explorer/shared"

const MOCK_FILE: FileDto = {
  id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  folderId: "11111111-1111-1111-1111-111111111111",
  name: "report.pdf",
  size: 1024 * 120,
  mimeType: "application/pdf",
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
}

const makeMockRepo = (overrides: Partial<IFileRepository> = {}): IFileRepository => ({
  findByFolderId: mock(async () => [] as FileDto[]),
  search: mock(async () => [] as FileDto[]),
  ...overrides,
})

describe("FileService", () => {
  describe("getFilesByFolder", () => {
    it("returns files for a given folder", async () => {
      const repo = makeMockRepo({ findByFolderId: mock(async () => [MOCK_FILE]) })
      const service = new FileService(repo)

      const result = await service.getFilesByFolder(MOCK_FILE.folderId)

      expect(result).toEqual([MOCK_FILE])
      expect(repo.findByFolderId).toHaveBeenCalledWith(MOCK_FILE.folderId)
    })

    it("returns empty array for a folder with no files", async () => {
      const repo = makeMockRepo({ findByFolderId: mock(async () => []) })
      const service = new FileService(repo)

      const result = await service.getFilesByFolder("some-folder-id")

      expect(result).toEqual([])
    })
  })

  describe("searchFiles", () => {
    it("calls repository with trimmed query", async () => {
      const repo = makeMockRepo({ search: mock(async () => [MOCK_FILE]) })
      const service = new FileService(repo)

      const result = await service.searchFiles("  report  ")

      expect(repo.search).toHaveBeenCalledWith("report")
      expect(result).toEqual([MOCK_FILE])
    })

    it("returns empty array without calling repository for blank query", async () => {
      const repo = makeMockRepo()
      const service = new FileService(repo)

      const result = await service.searchFiles("")

      expect(result).toEqual([])
      expect(repo.search).not.toHaveBeenCalled()
    })
  })
})
