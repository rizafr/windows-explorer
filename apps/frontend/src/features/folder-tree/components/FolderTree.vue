<script setup lang="ts">
import { computed } from "vue"
import { useExplorerStore } from "@/features/explorer/store/explorer.store"
import TreeNode from "./TreeNode.vue"
import LoadingSpinner from "@/shared/components/LoadingSpinner.vue"
import EmptyState from "@/shared/components/EmptyState.vue"

const store = useExplorerStore()

const isEmpty = computed(
  () => !store.isTreeLoading && store.folderTree.length === 0 && !store.treeError
)
</script>

<template>
  <div class="folder-tree" aria-label="Folder tree">
    <!-- Loading state -->
    <div v-if="store.isTreeLoading" class="folder-tree__state">
      <LoadingSpinner label="Loading folders..." />
    </div>

    <!-- Error state -->
    <div v-else-if="store.treeError" class="folder-tree__state">
      <EmptyState
        icon="error"
        title="Failed to load"
        :description="store.treeError"
      />
    </div>

    <!-- Empty state -->
    <div v-else-if="isEmpty" class="folder-tree__state">
      <EmptyState
        icon="folder"
        title="No folders"
        description="The file system is empty"
      />
    </div>

    <!-- Tree -->
    <ul v-else class="folder-tree__list" role="tree" aria-label="Folder structure">
      <TreeNode
        v-for="node in store.folderTree"
        :key="node.id"
        :node="node"
        :depth="0"
      />
    </ul>
  </div>
</template>

<style scoped>
.folder-tree {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--space-2) 0;
}

.folder-tree__state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
}

.folder-tree__list {
  list-style: none;
  padding: 0;
  margin: 0;
}
</style>
