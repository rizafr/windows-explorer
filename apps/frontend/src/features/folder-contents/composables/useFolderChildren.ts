import { watch } from "vue"
import { foldersApi } from "@/shared/api/folders.api"
import { useExplorerStore } from "@/features/explorer/store/explorer.store"

/**
 * Composable that loads and manages the right panel content.
 * Watches the selected folder in the store and fetches its children.
 */
export function useFolderChildren() {
  const store = useExplorerStore()

  async function loadChildren(folderId: string): Promise<void> {
    store.isChildrenLoading = true
    store.childrenError = null

    try {
      const response = await foldersApi.getChildren(folderId)
      store.setRightPanelContent(response.data.folders, response.data.files)
    } catch (err) {
      store.childrenError =
        err instanceof Error ? err.message : "Failed to load folder contents"
      store.clearRightPanel()
    } finally {
      store.isChildrenLoading = false
    }
  }

  // Automatically reload children when selected folder changes
  watch(
    () => store.selectedFolderId,
    (newId) => {
      if (newId) {
        loadChildren(newId)
      } else {
        store.clearRightPanel()
      }
    }
  )

  return {
    folders: store.rightPanelFolders,
    files: store.rightPanelFiles,
    isLoading: store.isChildrenLoading,
    error: store.childrenError,
  }
}
