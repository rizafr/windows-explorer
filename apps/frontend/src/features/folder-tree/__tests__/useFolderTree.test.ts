import { describe, it, expect } from "vitest"
import { buildTree } from "@/features/folder-tree/composables/useFolderTree"
import type { FolderDto } from "@windows-explorer/shared"

/**
 * Unit tests for the O(n) buildTree algorithm.
 * buildTree is a pure function, so no mocking is needed.
 */

const ROOT_A: FolderDto = {
  id: "aaa",
  name: "Documents",
  parentId: null,
  hasChildren: true,
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
}

const CHILD_B: FolderDto = {
  id: "bbb",
  name: "Work",
  parentId: "aaa",
  hasChildren: false,
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
}

const CHILD_C: FolderDto = {
  id: "ccc",
  name: "Personal",
  parentId: "aaa",
  hasChildren: false,
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
}

const GRANDCHILD_D: FolderDto = {
  id: "ddd",
  name: "Projects",
  parentId: "bbb",
  hasChildren: false,
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
}

describe("buildTree", () => {
  it("returns empty array for empty input", () => {
    expect(buildTree([])).toEqual([])
  })

  it("creates a root node from a folder with no parentId", () => {
    const result = buildTree([ROOT_A])

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("aaa")
    expect(result[0].parentId).toBeNull()
    expect(result[0].children).toEqual([])
  })

  it("attaches children to their parent", () => {
    const result = buildTree([ROOT_A, CHILD_B, CHILD_C])

    expect(result).toHaveLength(1)
    const root = result[0]
    expect(root.children).toHaveLength(2)
    const ids = root.children.map((c) => c.id)
    expect(ids).toContain("bbb")
    expect(ids).toContain("ccc")
  })

  it("handles multiple levels of nesting", () => {
    const result = buildTree([ROOT_A, CHILD_B, GRANDCHILD_D])

    const root = result[0]
    expect(root.children).toHaveLength(1)
    const work = root.children[0]
    expect(work.id).toBe("bbb")
    expect(work.children).toHaveLength(1)
    expect(work.children[0].id).toBe("ddd")
  })

  it("sorts children alphabetically at each level", () => {
    const result = buildTree([ROOT_A, CHILD_B, CHILD_C])

    const childNames = result[0].children.map((c) => c.name)
    // "Personal" < "Work" alphabetically
    expect(childNames).toEqual(["Personal", "Work"])
  })

  it("initializes all nodes with isExpanded = false", () => {
    const result = buildTree([ROOT_A, CHILD_B, CHILD_C])

    expect(result[0].isExpanded).toBe(false)
    for (const child of result[0].children) {
      expect(child.isExpanded).toBe(false)
    }
  })

  it("handles multiple root folders", () => {
    const ROOT_2: FolderDto = {
      id: "zzz",
      name: "Pictures",
      parentId: null,
      hasChildren: false,
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
    }

    const result = buildTree([ROOT_A, ROOT_2])
    expect(result).toHaveLength(2)
  })

  it("ignores orphan nodes (parentId points to non-existent folder)", () => {
    const orphan: FolderDto = {
      id: "orphan",
      name: "Orphan",
      parentId: "does-not-exist",
      hasChildren: false,
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
    }

    const result = buildTree([ROOT_A, orphan])
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("aaa")
  })

  it("handles a flat list with no hierarchy (all roots)", () => {
    const folders: FolderDto[] = [
      { ...ROOT_A, parentId: null },
      { ...CHILD_B, parentId: null },
      { ...CHILD_C, parentId: null },
    ]

    const result = buildTree(folders)
    expect(result).toHaveLength(3)
    for (const node of result) {
      expect(node.children).toHaveLength(0)
    }
  })
})
