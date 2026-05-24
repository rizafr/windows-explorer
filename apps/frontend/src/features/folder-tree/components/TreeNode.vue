<script setup lang="ts">
import { computed } from "vue"
import { useExplorerStore } from "@/features/explorer/store/explorer.store"
import TreeNodeIcon from "./TreeNodeIcon.vue"
import type { FolderNode } from "@windows-explorer/shared"

/**
 * TreeNode — recursive component built entirely from scratch.
 *
 * Each instance renders:
 * 1. A clickable row (select folder, optionally expand)
 * 2. If expanded: its children rendered as TreeNode instances
 *
 * Recursion is bounded by the actual folder depth (no infinite loops).
 */
const props = defineProps<{
  node: FolderNode
  depth: number
}>()

const store = useExplorerStore()

const isSelected = computed(() => store.isSelected(props.node.id))
const isExpanded = computed(() => store.isExpanded(props.node.id))

// Indentation: 20px per depth level (matches IDE-style explorer)
const indentStyle = computed(() => ({
  paddingLeft: `${props.depth * 20 + 8}px`,
}))

function handleClick() {
  // Select the folder (triggers right panel load)
  store.selectFolder(props.node.id)
  store.setSearchResultsVisible(false)
  // Expand if it has children
  if (props.node.hasChildren) {
    store.expandFolder(props.node.id)
  }
}

function handleToggle(event: MouseEvent) {
  event.stopPropagation()
  store.toggleExpanded(props.node.id)
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault()
    handleClick()
  } else if (event.key === "ArrowRight" && !isExpanded.value && props.node.hasChildren) {
    event.preventDefault()
    store.expandFolder(props.node.id)
  } else if (event.key === "ArrowLeft" && isExpanded.value) {
    event.preventDefault()
    store.toggleExpanded(props.node.id)
  }
}
</script>

<template>
  <li class="tree-node" role="treeitem" :aria-expanded="node.hasChildren ? isExpanded : undefined" :aria-selected="isSelected">
    <!-- Node row -->
    <div
      class="tree-node__row"
      :class="{ 'tree-node__row--selected': isSelected, 'tree-node__row--has-children': node.hasChildren }"
      :style="indentStyle"
      tabindex="0"
      @click="handleClick"
      @keydown="handleKeydown"
    >
      <!-- Chevron toggle (separate from row click for UX) -->
      <span
        v-if="node.hasChildren"
        class="tree-node__toggle"
        @click.stop="handleToggle"
        :aria-label="isExpanded ? 'Collapse' : 'Expand'"
      />

      <TreeNodeIcon
        :is-expanded="isExpanded"
        :has-children="node.hasChildren"
        :is-selected="isSelected"
      />

      <span class="tree-node__name truncate" :title="node.name">
        {{ node.name }}
      </span>
    </div>

    <!-- Children — rendered only when expanded (v-if, not v-show, for memory efficiency) -->
    <Transition name="tree-expand">
      <ul
        v-if="isExpanded && node.children.length > 0"
        class="tree-node__children"
        role="group"
      >
        <TreeNode
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          :depth="depth + 1"
        />
      </ul>
    </Transition>
  </li>
</template>

<style scoped>
.tree-node {
  list-style: none;
}

.tree-node__row {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding-right: var(--space-3);
  cursor: pointer;
  border-radius: var(--radius-sm);
  margin: 1px var(--space-2);
  position: relative;
  user-select: none;
  color: var(--color-text-secondary);
  transition: background-color var(--transition-fast), color var(--transition-fast);
  outline: none;
}

.tree-node__row:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.tree-node__row:focus-visible {
  box-shadow: 0 0 0 2px var(--color-accent);
}

.tree-node__row--selected {
  background-color: var(--color-bg-selected) !important;
  color: var(--color-text-selected) !important;
}

.tree-node__row--selected:hover {
  background-color: var(--color-bg-selected-hover) !important;
}

.tree-node__toggle {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  cursor: pointer;
}

/* Override: actual icon and name sit above the transparent toggle layer */
.tree-node__row > :not(.tree-node__toggle) {
  position: relative;
  z-index: 2;
}

.tree-node__name {
  font-size: var(--font-size-sm);
  font-weight: 400;
  line-height: 1;
  flex: 1;
  min-width: 0;
}

.tree-node__children {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow: hidden;
}

/* ─── Tree expand animation ──────────────────────────────────────────────────── */
.tree-expand-enter-active,
.tree-expand-leave-active {
  transition: opacity var(--transition-base), max-height var(--transition-slow);
  max-height: 9999px;
}

.tree-expand-enter-from,
.tree-expand-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
