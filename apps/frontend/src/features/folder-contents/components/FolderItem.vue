<script setup lang="ts">
import { computed } from "vue"
import type { FolderChildDto } from "@windows-explorer/shared"
import { useExplorerStore } from "@/features/explorer/store/explorer.store"

const props = defineProps<{
  folder: FolderChildDto
}>()

const emit = defineEmits<{
  click: [id: string]
}>()

const store = useExplorerStore()

function handleClick() {
  store.selectFolder(props.folder.id)
  store.expandFolder(props.folder.id)
  store.setSearchResultsVisible(false)
  emit("click", props.folder.id)
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault()
    handleClick()
  }
}
</script>

<template>
  <div
    class="folder-item"
    role="button"
    tabindex="0"
    :aria-label="`Open folder ${folder.name}`"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <!-- Folder icon -->
    <div class="folder-item__icon">
      <svg
        width="40"
        height="36"
        viewBox="0 0 40 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 4C2 2.895 2.895 2 4 2H15L19 7H36C37.105 7 38 7.895 38 9V32C38 33.105 37.105 34 36 34H4C2.895 34 2 33.105 2 32V4Z"
          fill="#F5A623"
        />
        <path
          d="M2 10C2 8.895 2.895 8 4 8H36C37.105 8 38 8.895 38 10V32C38 33.105 37.105 34 36 34H4C2.895 34 2 33.105 2 32V10Z"
          fill="#FFCA5C"
        />
        <rect x="2" y="8" width="36" height="2" fill="#F5A623" rx="0.5" />
      </svg>

      <!-- Children badge -->
      <span v-if="folder.hasChildren" class="folder-item__badge" aria-hidden="true" />
    </div>

    <span class="folder-item__name truncate" :title="folder.name">
      {{ folder.name }}
    </span>
  </div>
</template>

<style scoped>
.folder-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  background-color: transparent;
  border: 1px solid transparent;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    transform var(--transition-fast);
  user-select: none;
  outline: none;
  min-width: 80px;
  max-width: 100px;
}

.folder-item:hover {
  background-color: var(--color-bg-card-hover);
  border-color: var(--color-border);
  transform: translateY(-1px);
}

.folder-item:focus-visible {
  box-shadow: 0 0 0 2px var(--color-accent);
  border-color: var(--color-accent);
}

.folder-item:active {
  transform: scale(0.97);
}

.folder-item__icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.folder-item__badge {
  position: absolute;
  bottom: 2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background-color: var(--color-accent);
  border-radius: 50%;
  border: 1.5px solid var(--color-bg-secondary);
}

.folder-item__name {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-align: center;
  line-height: 1.3;
  max-width: 80px;
}
</style>
