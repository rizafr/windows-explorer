import { describe, it, expect, mock, beforeEach } from "bun:test"
import { FolderService, FolderNotFoundError } from "../../src/application/services/folder.service"
import type { IFolderRepository } from "../../src/application/repositories/folder.repository.interface"
import type { FolderDto, FolderChildDto } from "@windows-explorer/shared"

// ─── Mock repository factory ──────────────────────────────────────────────────

const makeMockRepo = (overrides: Partial<IFolderRepository> = {}): IFolderRepository => ({
  findAll: mock(async () => [] as FolderDto[]),
  findChildren: mock(async () => [] as FolderChildDto[]),
  findRoots: mock(async () => [] as FolderChildDto[]),
  exists: mock(async () => true),
  search: mock(async () => [] as FolderDto[]),
  ...overrides,
})

const MOCK_FOLDER: FolderDto = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "Documents",
  parentId: null,
  hasChildren: true,
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
}

const MOCK_CHILD: FolderChildDto = {
  id: "22222222-2222-2222-2222-222222222222",
  name: "Work",
  hasChildren: false,
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("FolderService", () => {
  describe("getFolderTree", () => {
    it("returns the full flat folder list from the repository", async () => {
      const repo = makeMockRepo({ findAll: mock(async () => [MOCK_FOLDER]) })
      const service = new FolderService(repo)

      const result = await service.getFolderTree()

      expect(result).toEqual([MOCK_FOLDER])
      expect(repo.findAll).toHaveBeenCalledTimes(1)
    })

    it("returns an empty array when there are no folders", async () => {
      const repo = makeMockRepo({ findAll: mock(async () => []) })
      const service = new FolderService(repo)

      const result = await service.getFolderTree()

      expect(result).toEqual([])
    })
  })

  describe("getFolderChildren", () => {
    it("returns direct children when folder exists", async () => {
      const repo = makeMockRepo({
        exists: mock(async () => true),
        findChildren: mock(async () => [MOCK_CHILD]),
      })
      const service = new FolderService(repo)

      const result = await service.getFolderChildren(MOCK_FOLDER.id)

      expect(result).toEqual([MOCK_CHILD])
      expect(repo.exists).toHaveBeenCalledWith(MOCK_FOLDER.id)
      expect(repo.findChildren).toHaveBeenCalledWith(MOCK_FOLDER.id)
    })

    it("throws FolderNotFoundError when folder does not exist", async () => {
      const repo = makeMockRepo({ exists: mock(async () => false) })
      const service = new FolderService(repo)

      expect(service.getFolderChildren("non-existent-id")).rejects.toThrow(
        FolderNotFoundError
      )
    })

    it("does not call findChildren when folder does not exist", async () => {
      const repo = makeMockRepo({ exists: mock(async () => false) })
      const service = new FolderService(repo)

      await service.getFolderChildren("non-existent-id").catch(() => {})

      expect(repo.findChildren).not.toHaveBeenCalled()
    })
  })

  describe("searchFolders", () => {
    it("calls repository search with trimmed query", async () => {
      const repo = makeMockRepo({ search: mock(async () => [MOCK_FOLDER]) })
      const service = new FolderService(repo)

      const result = await service.searchFolders("  Documents  ")

      expect(repo.search).toHaveBeenCalledWith("Documents")
      expect(result).toEqual([MOCK_FOLDER])
    })

    it("returns empty array for empty query without calling repository", async () => {
      const repo = makeMockRepo()
      const service = new FolderService(repo)

      const result = await service.searchFolders("   ")

      expect(result).toEqual([])
      expect(repo.search).not.toHaveBeenCalled()
    })
  })

  describe("getRootFolders", () => {
    it("delegates to repository findRoots", async () => {
      const repo = makeMockRepo({ findRoots: mock(async () => [MOCK_CHILD]) })
      const service = new FolderService(repo)

      const result = await service.getRootFolders()

      expect(result).toEqual([MOCK_CHILD])
      expect(repo.findRoots).toHaveBeenCalledTimes(1)
    })
  })
})

describe("FolderNotFoundError", () => {
  it("has correct name and message", () => {
    const error = new FolderNotFoundError("abc-123")
    expect(error.name).toBe("FolderNotFoundError")
    expect(error.message).toContain("abc-123")
    expect(error.folderId).toBe("abc-123")
    expect(error).toBeInstanceOf(Error)
  })
})
