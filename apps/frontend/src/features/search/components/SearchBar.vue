<script setup lang="ts">
import { ref } from "vue"
import { useSearch } from "@/features/search/composables/useSearch"
import { useExplorerStore } from "@/features/explorer/store/explorer.store"
import type { FolderDto } from "@windows-explorer/shared"

const { query, isLoading, resultFolders, resultFiles, isSearching, hasResults, totalResults, onQueryChange, clearSearch } =
  useSearch()
const store = useExplorerStore()

const inputRef = ref<HTMLInputElement | null>(null)
const isResultsOpen = ref(false)

function handleInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  isResultsOpen.value = value.trim().length > 0
  onQueryChange(value)
}

function handleClear() {
  isResultsOpen.value = false
  clearSearch()
  inputRef.value?.focus()
}

function selectSearchFolder(folder: FolderDto) {
  store.setSearchQuery(folder.name)
  store.setSearchResults([folder], [])
  store.selectFolder(folder.id)
  store.expandFolder(folder.id)
  store.setSearchResultsVisible(false)
  isResultsOpen.value = false
}

function handleFocus() {
  if (isSearching.value) {
    isResultsOpen.value = true
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    isResultsOpen.value = false
  }
}
</script>

<template>
  <div class="search-bar" role="search">
    <div class="search-bar__input-wrapper">
      <!-- Search icon -->
      <svg
        class="search-bar__icon"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.5" />
        <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>

      <input
        ref="inputRef"
        id="search-input"
        class="search-bar__input"
        type="search"
        placeholder="Search folders and files..."
        autocomplete="off"
        :value="query"
        @input="handleInput"
        @focus="handleFocus"
        @keydown="handleKeydown"
        aria-label="Search folders and files"
        aria-autocomplete="list"
        :aria-busy="isLoading"
      />

      <!-- Loading spinner inline -->
      <svg
        v-if="isLoading"
        class="search-bar__spinner"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="7" cy="7" r="5.5" stroke="var(--color-border)" stroke-width="2" />
        <path d="M7 1.5A5.5 5.5 0 0112.5 7" stroke="var(--color-accent)" stroke-width="2" stroke-linecap="round" />
      </svg>

      <!-- Clear button -->
      <button
        v-else-if="query"
        class="search-bar__clear"
        type="button"
        aria-label="Clear search"
        @click="handleClear"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <!-- Search results dropdown -->
    <Transition name="dropdown">
      <div
        v-if="isSearching && isResultsOpen"
        class="search-bar__results"
        role="listbox"
        aria-label="Search results"
      >
        <div v-if="isLoading" class="search-bar__results-state">
          Searching...
        </div>

        <template v-else-if="hasResults">
          <div class="search-bar__results-header">
            {{ totalResults }} result{{ totalResults !== 1 ? 's' : '' }}
          </div>

          <!-- Folder results -->
          <div v-if="resultFolders.length > 0">
            <div class="search-bar__results-group-label">Folders</div>
            <button
              v-for="folder in resultFolders"
              :key="folder.id"
              class="search-bar__result-item"
              type="button"
              role="option"
              @click="selectSearchFolder(folder)"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 2.5C1 1.948 1.448 1.5 2 1.5H5.5L7 3H12C12.552 3 13 3.448 13 4V11.5C13 12.052 12.552 12.5 12 12.5H2C1.448 12.5 1 12.052 1 11.5V2.5Z" fill="#F5A623"/>
              </svg>
              <span class="truncate">{{ folder.name }}</span>
              <span class="search-bar__result-meta">{{ folder.parentId ? 'Subfolder' : 'Root' }}</span>
            </button>
          </div>

          <!-- File results -->
          <div v-if="resultFiles.length > 0">
            <div class="search-bar__results-group-label">Files</div>
            <div
              v-for="file in resultFiles"
              :key="file.id"
              class="search-bar__result-item search-bar__result-item--file"
            >
              <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                <path d="M1 1C1 0.448 1.448 0 2 0H8L11 3V13C11 13.552 10.552 14 10 14H2C1.448 14 1 13.552 1 13V1Z" fill="var(--color-bg-tertiary)" stroke="var(--color-border)" stroke-width="0.8"/>
                <path d="M8 0L11 3H9C8.448 3 8 2.552 8 2V0Z" fill="var(--color-border)"/>
              </svg>
              <span class="truncate">{{ file.name }}</span>
            </div>
          </div>
        </template>

        <div v-else-if="!isLoading" class="search-bar__results-state">
          No results for "{{ query }}"
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.search-bar {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-bar__input-wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0 var(--space-3);
  height: 30px;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.search-bar__input-wrapper:focus-within {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px var(--color-accent-dim);
}

.search-bar__icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.search-bar__input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-family: var(--font-family);
  min-width: 0;
}

.search-bar__input::placeholder {
  color: var(--color-text-muted);
}

/* Remove browser default search cancel button */
.search-bar__input::-webkit-search-cancel-button {
  display: none;
}

.search-bar__spinner {
  flex-shrink: 0;
  animation: spin 0.8s linear infinite;
}

.search-bar__clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  border-radius: 50%;
  padding: 0;
  flex-shrink: 0;
  transition: color var(--transition-fast), background-color var(--transition-fast);
}

.search-bar__clear:hover {
  color: var(--color-text-primary);
  background-color: var(--color-bg-hover);
}

/* ─── Results dropdown ───────────────────────────────────────────────────────── */
.search-bar__results {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  z-index: 100;
  max-height: 320px;
  overflow-y: auto;
  padding: var(--space-2) 0;
}

.search-bar__results-header {
  padding: var(--space-1) var(--space-3);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--space-1);
}

.search-bar__results-group-label {
  padding: var(--space-1) var(--space-3);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.search-bar__result-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  width: 100%;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-family: var(--font-family);
  text-align: left;
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.search-bar__result-item:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.search-bar__result-item--file {
  cursor: default;
  opacity: 0.8;
}

.search-bar__result-meta {
  margin-left: auto;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.search-bar__results-state {
  padding: var(--space-4) var(--space-3);
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

/* ─── Dropdown animation ──────────────────────────────────────────────────────── */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
