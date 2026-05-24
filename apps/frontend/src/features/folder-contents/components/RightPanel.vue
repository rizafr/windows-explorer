<script setup lang="ts">
import { computed } from "vue"
import { useExplorerStore } from "@/features/explorer/store/explorer.store"
import FolderItem from "./FolderItem.vue"
import FileItem from "./FileItem.vue"
import LoadingSpinner from "@/shared/components/LoadingSpinner.vue"
import EmptyState from "@/shared/components/EmptyState.vue"

const store = useExplorerStore()

const hasContent = computed(
  () => displayFolders.value.length > 0 || displayFiles.value.length > 0
)

const selectedName = computed(() => store.selectedFolder?.name ?? "")
const displayFolders = computed(() =>
  store.isSearchResultsVisible ? store.searchResultFolders : store.rightPanelFolders
)
const displayFiles = computed(() =>
  store.isSearchResultsVisible ? store.searchResultFiles : store.rightPanelFiles
)
const isLoading = computed(() =>
  store.isSearchResultsVisible ? store.isSearchLoading : store.isChildrenLoading
)
const errorMessage = computed(() =>
  store.isSearchResultsVisible ? store.searchError : store.childrenError
)
const headerTitle = computed(() =>
  store.isSearchResultsVisible ? `Search results for "${store.searchQuery.trim()}"` : selectedName.value
)

function selectBreadcrumb(folderId: string) {
  store.selectFolder(folderId)
  store.expandFolder(folderId)
  store.setSearchResultsVisible(false)
}
</script>

<template>
  <div class="right-panel">
    <!-- Breadcrumb / header -->
    <div class="right-panel__header" v-if="store.selectedFolderId || store.isSearchResultsVisible">
      <span class="right-panel__breadcrumb">
        <svg v-if="store.isSearchResultsVisible" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.5" />
          <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
        <svg v-else width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M1.5 2.5C1.5 1.948 1.948 1.5 2.5 1.5H5.5L7 3H11.5C12.052 3 12.5 3.448 12.5 4V11.5C12.5 12.052 12.052 12.5 11.5 12.5H2.5C1.948 12.5 1.5 12.052 1.5 11.5V2.5Z" fill="#F5A623"/>
        </svg>
        <span v-if="store.isSearchResultsVisible">{{ headerTitle }}</span>
        <span v-else class="right-panel__breadcrumb-path">
          <template v-for="(folder, index) in store.selectedFolderPath" :key="folder.id">
            <span v-if="index > 0" class="right-panel__breadcrumb-separator">/</span>
            <button
              class="right-panel__breadcrumb-link"
              type="button"
              :aria-current="index === store.selectedFolderPath.length - 1 ? 'page' : undefined"
              @click="selectBreadcrumb(folder.id)"
            >
              {{ folder.name }}
            </button>
          </template>
        </span>
      </span>
      <span class="right-panel__count">
        {{ displayFolders.length }} folder{{ displayFolders.length !== 1 ? 's' : '' }},
        {{ displayFiles.length }} file{{ displayFiles.length !== 1 ? 's' : '' }}
      </span>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="right-panel__state">
      <LoadingSpinner :label="store.isSearchResultsVisible ? 'Searching...' : 'Loading contents...'" />
    </div>

    <!-- Error -->
    <div v-else-if="errorMessage" class="right-panel__state">
      <EmptyState
        icon="error"
        :title="store.isSearchResultsVisible ? 'Search failed' : 'Failed to load'"
        :description="errorMessage"
      />
    </div>

    <!-- Empty search -->
    <div v-else-if="store.isSearchResultsVisible && !hasContent" class="right-panel__state">
      <EmptyState
        icon="search"
        title="No results"
        :description="'No folders or files found for ' + store.searchQuery.trim()"
      />
    </div>

    <!-- No folder selected -->
    <div v-else-if="!store.selectedFolderId" class="right-panel__state">
      <EmptyState
        icon="select"
        title="Select a folder"
        description="Click a folder in the left panel to view its contents"
      />
    </div>

    <!-- Empty folder -->
    <div v-else-if="!hasContent" class="right-panel__state">
      <EmptyState
        icon="folder"
        title="Empty folder"
        description="This folder contains no subfolders or files"
      />
    </div>

    <!-- Content grid -->
    <div v-else class="right-panel__content">
      <!-- Folders section -->
      <section v-if="displayFolders.length > 0" class="right-panel__section">
        <h2 class="right-panel__section-title">Folders</h2>
        <div class="right-panel__grid" role="list" aria-label="Subfolders">
          <FolderItem
            v-for="folder in displayFolders"
            :key="folder.id"
            :folder="folder"
            role="listitem"
          />
        </div>
      </section>

      <!-- Files section -->
      <section v-if="displayFiles.length > 0" class="right-panel__section">
        <h2 class="right-panel__section-title">Files</h2>
        <div class="right-panel__grid" role="list" aria-label="Files">
          <FileItem
            v-for="file in displayFiles"
            :key="file.id"
            :file="file"
            role="listitem"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--color-bg-primary);
}

.right-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
  flex-shrink: 0;
}

.right-panel__breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-primary);
  min-width: 0;
}

.right-panel__breadcrumb-path {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  min-width: 0;
  overflow: hidden;
}

.right-panel__breadcrumb-link {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  cursor: pointer;
  font: inherit;
  padding: 2px 4px;
}

.right-panel__breadcrumb-link:hover {
  background-color: var(--color-bg-hover);
}

.right-panel__breadcrumb-link[aria-current="page"] {
  color: var(--color-text-primary);
  cursor: default;
}

.right-panel__breadcrumb-link[aria-current="page"]:hover {
  background-color: transparent;
}

.right-panel__breadcrumb-separator {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.right-panel__count {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.right-panel__state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.right-panel__content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.right-panel__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.right-panel__section-title {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.right-panel__grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
</style>
