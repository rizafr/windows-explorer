<script setup lang="ts">
/**
 * TreeNodeIcon — renders the folder open/close/file chevron icon.
 * Pure presentational component; all logic driven by props.
 */
defineProps<{
  isExpanded: boolean
  hasChildren: boolean
  isSelected: boolean
}>()
</script>

<template>
  <span class="tree-node-icon" :class="{ 'is-selected': isSelected }" aria-hidden="true">
    <!-- Chevron — only show if folder has children -->
    <span
      v-if="hasChildren"
      class="chevron"
      :class="{ 'chevron--open': isExpanded }"
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M3 2L7 5L3 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>
    <span v-else class="chevron chevron--empty" />

    <!-- Folder icon -->
    <svg
      class="folder-icon"
      :class="{ 'folder-icon--open': isExpanded }"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        v-if="!isExpanded"
        d="M1.5 3.5C1.5 2.948 1.948 2.5 2.5 2.5H6L7.5 4H13.5C14.052 4 14.5 4.448 14.5 5V12.5C14.5 13.052 14.052 13.5 13.5 13.5H2.5C1.948 13.5 1.5 13.052 1.5 12.5V3.5Z"
        fill="#F5A623"
        stroke="#E09010"
        stroke-width="0.5"
      />
      <path
        v-else
        d="M1.5 4C1.5 3.448 1.948 3 2.5 3H6L7.5 4.5H13.5C14.052 4.5 14.5 4.948 14.5 5.5V5.5L13 12.5C12.85 13.1 12.3 13.5 11.7 13.5H2.5C1.948 13.5 1.5 13.052 1.5 12.5V4Z"
        fill="#FFCA5C"
        stroke="#E09010"
        stroke-width="0.5"
      />
    </svg>
  </span>
</template>

<style scoped>
.tree-node-icon {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  color: var(--color-text-muted);
  transition: transform var(--transition-fast), color var(--transition-fast);
  flex-shrink: 0;
}

.chevron--open {
  transform: rotate(90deg);
  color: var(--color-text-secondary);
}

.is-selected .chevron {
  color: rgba(255, 255, 255, 0.7);
}

.chevron--empty {
  visibility: hidden;
}

.folder-icon {
  flex-shrink: 0;
}
</style>
