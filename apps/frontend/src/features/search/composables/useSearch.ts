import { storeToRefs } from "pinia"
import { foldersApi } from "@/shared/api/folders.api"
import { useExplorerStore } from "@/features/explorer/store/explorer.store"

const DEBOUNCE_MS = 300

/**
 * Composable for the search functionality.
 * Debounces the search query and fetches results from the API.
 */
export function useSearch() {
  const store = useExplorerStore()
  const {
    searchQuery: query,
    isSearchLoading: isLoading,
    searchError: error,
    searchResultFolders: resultFolders,
    searchResultFiles: resultFiles,
    hasSearchResults: hasResults,
    totalSearchResults: totalResults,
    isSearchActive: isSearching,
  } = storeToRefs(store)
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let activeRequest = 0

  async function performSearch(q: string): Promise<void> {
    const trimmed = q.trim()
    if (trimmed.length === 0) {
      store.clearSearchResults()
      store.isSearchLoading = false
      return
    }

    const requestId = ++activeRequest
    store.setSearchResultsVisible(true)
    store.isSearchLoading = true
    store.searchError = null

    try {
      const response = await foldersApi.search(trimmed)
      if (requestId !== activeRequest) return
      store.setSearchResults(response.data.folders, response.data.files)
    } catch (err) {
      if (requestId !== activeRequest) return
      store.searchError = err instanceof Error ? err.message : "Search failed"
      store.clearSearchResults()
    } finally {
      if (requestId === activeRequest) {
        store.isSearchLoading = false
      }
    }
  }

  function onQueryChange(newQuery: string): void {
    store.setSearchQuery(newQuery)
    if (debounceTimer) clearTimeout(debounceTimer)

    if (newQuery.trim().length === 0) {
      activeRequest++
      store.clearSearchResults()
      store.searchError = null
      store.isSearchLoading = false
      return
    }

    store.setSearchResultsVisible(true)
    store.isSearchLoading = true
    store.searchError = null
    debounceTimer = setTimeout(() => performSearch(newQuery), DEBOUNCE_MS)
  }

  function clearSearch(): void {
    store.setSearchQuery("")
    store.clearSearchResults()
    store.searchError = null
    store.isSearchLoading = false
    activeRequest++
    if (debounceTimer) clearTimeout(debounceTimer)
  }


  return {
    query,
    isLoading,
    error,
    resultFolders,
    resultFiles,
    hasResults,
    totalResults,
    isSearching,
    onQueryChange,
    clearSearch
  }
}
