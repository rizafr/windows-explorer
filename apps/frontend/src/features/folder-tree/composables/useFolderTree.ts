import { onMounted } from "vue"
import { foldersApi } from "@/shared/api/folders.api"
import { useExplorerStore } from "@/features/explorer/store/explorer.store"
import type { FolderDto, FolderNode } from "@windows-explorer/shared"

/**
 * Builds a nested tree from a flat array of FolderDto.
 *
 * Algorithm: O(n) — two passes with a Map for O(1) lookups.
 * 1. Create a Map of id → FolderNode for instant parent lookup
 * 2. Iterate nodes: root nodes go to `roots[]`, others are appended to parent.children
 *
 * Exported separately so it can be unit-tested without Vue component context.
 */
export function buildTree(flatFolders: FolderDto[]): FolderNode[] {
  const nodeMap = new Map<string, FolderNode>()
  const roots: FolderNode[] = []

  // First pass: create all nodes
  for (const folder of flatFolders) {
    nodeMap.set(folder.id, {
      ...folder,
      children: [],
      isExpanded: false,
    })
  }

  // Second pass: wire up parent–child relationships
  for (const node of nodeMap.values()) {
    if (node.parentId === null) {
      roots.push(node)
    } else {
      const parent = nodeMap.get(node.parentId)
      if (parent) {
        parent.children.push(node)
      }
    }
  }

  // Sort children alphabetically at each level
  sortNodes(roots)

  return roots
}

function sortNodes(nodes: FolderNode[]): void {
  nodes.sort((a, b) => a.name.localeCompare(b.name))
  for (const node of nodes) {
    if (node.children.length > 0) {
      sortNodes(node.children)
    }
  }
}

/**
 * Composable that manages the folder tree data.
 *
 * Responsible for:
 * 1. Fetching the flat folder list from the API on mount
 * 2. Building a nested FolderNode tree from the flat list — O(n)
 * 3. Exposing loading/error state
 */
export function useFolderTree() {
  const store = useExplorerStore()

  async function loadTree(): Promise<void> {
    store.isTreeLoading = true
    store.treeError = null

    try {
      const response = await foldersApi.getTree()
      const tree = buildTree(response.data)
      store.setFolderTree(tree)
    } catch (err) {
      store.treeError =
        err instanceof Error ? err.message : "Failed to load folder tree"
    } finally {
      store.isTreeLoading = false
    }
  }

  onMounted(() => {
    loadTree()
  })

  return {
    folderTree: store.folderTree,
    isLoading: store.isTreeLoading,
    error: store.treeError,
    reload: loadTree,
  }
}
