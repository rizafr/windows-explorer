import { defineStore } from "pinia"
import { ref, computed } from "vue"
import type { FolderNode, FolderDto, FolderChildDto, FileDto } from "@windows-explorer/shared"

/**
 * Central store for the Windows Explorer application state.
 * Manages the folder tree, selected folder, and right panel content.
 */
export const useExplorerStore = defineStore("explorer", () => {
  // ── State ───────────────────────────────────────────────────────────────────
  const folderTree = ref<FolderNode[]>([])
  const selectedFolderId = ref<string | null>(null)
  const expandedFolderIds = ref<Set<string>>(new Set())

  // Right panel
  const rightPanelFolders = ref<FolderChildDto[]>([])
  const rightPanelFiles = ref<FileDto[]>([])

  // Search
  const searchQuery = ref("")
  const searchResultFolders = ref<FolderDto[]>([])
  const searchResultFiles = ref<FileDto[]>([])
  const isSearchResultsVisible = ref(false)

  // Loading states
  const isTreeLoading = ref(false)
  const isChildrenLoading = ref(false)
  const isSearchLoading = ref(false)

  // Error states
  const treeError = ref<string | null>(null)
  const childrenError = ref<string | null>(null)
  const searchError = ref<string | null>(null)

  // ── Getters ─────────────────────────────────────────────────────────────────
  const selectedFolder = computed(() => {
    if (!selectedFolderId.value) return null
    return findNodeById(folderTree.value, selectedFolderId.value)
  })
  const selectedFolderPath = computed(() => {
    if (!selectedFolderId.value) return []
    return findPathById(folderTree.value, selectedFolderId.value)
  })

  const isExpanded = (id: string) => expandedFolderIds.value.has(id)
  const isSelected = (id: string) => selectedFolderId.value === id
  const isSearchActive = computed(() => searchQuery.value.trim().length > 0)
  const hasSearchResults = computed(
    () => searchResultFolders.value.length > 0 || searchResultFiles.value.length > 0
  )
  const totalSearchResults = computed(
    () => searchResultFolders.value.length + searchResultFiles.value.length
  )

  // ── Actions ─────────────────────────────────────────────────────────────────
  function setFolderTree(nodes: FolderNode[]) {
    folderTree.value = nodes
  }

  function selectFolder(id: string) {
    selectedFolderId.value = id
  }

  function toggleExpanded(id: string) {
    if (expandedFolderIds.value.has(id)) {
      expandedFolderIds.value.delete(id)
    } else {
      expandedFolderIds.value.add(id)
    }
  }

  function expandFolder(id: string) {
    expandedFolderIds.value.add(id)
  }

  function setRightPanelContent(folders: FolderChildDto[], files: FileDto[]) {
    rightPanelFolders.value = folders
    rightPanelFiles.value = files
  }

  function clearRightPanel() {
    rightPanelFolders.value = []
    rightPanelFiles.value = []
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  function setSearchResults(folders: FolderDto[], files: FileDto[]) {
    searchResultFolders.value = folders
    searchResultFiles.value = files
  }

  function setSearchResultsVisible(isVisible: boolean) {
    isSearchResultsVisible.value = isVisible
  }

  function clearSearchResults() {
    searchResultFolders.value = []
    searchResultFiles.value = []
    isSearchResultsVisible.value = false
  }

  return {
    // State
    folderTree,
    selectedFolderId,
    expandedFolderIds,
    rightPanelFolders,
    rightPanelFiles,
    searchQuery,
    searchResultFolders,
    searchResultFiles,
    isSearchResultsVisible,
    isTreeLoading,
    isChildrenLoading,
    isSearchLoading,
    treeError,
    childrenError,
    searchError,
    // Getters
    selectedFolder,
    selectedFolderPath,
    isExpanded,
    isSelected,
    isSearchActive,
    hasSearchResults,
    totalSearchResults,
    // Actions
    setFolderTree,
    selectFolder,
    toggleExpanded,
    expandFolder,
    setRightPanelContent,
    clearRightPanel,
    setSearchQuery,
    setSearchResults,
    setSearchResultsVisible,
    clearSearchResults,
  }
})

// ─── Helper: find node by id in tree ─────────────────────────────────────────

function findNodeById(nodes: FolderNode[], id: string): FolderNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    const found = findNodeById(node.children, id)
    if (found) return found
  }
  return null
}

function findPathById(nodes: FolderNode[], id: string): FolderNode[] {
  for (const node of nodes) {
    if (node.id === id) return [node]

    const childPath = findPathById(node.children, id)
    if (childPath.length > 0) {
      return [node, ...childPath]
    }
  }

  return []
}
