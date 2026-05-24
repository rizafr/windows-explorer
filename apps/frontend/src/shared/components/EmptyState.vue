<script setup lang="ts">
const props = defineProps<{
  icon: "folder" | "error" | "select" | "search"
  title: string
  description?: string
}>()
</script>

<template>
  <div class="empty-state" role="status">
    <!-- Folder icon -->
    <svg
      v-if="icon === 'folder'"
      class="empty-state__icon"
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path d="M4 8C4 6.343 5.343 5 7 5H19L23 10H41C42.657 10 44 11.343 44 13V38C44 39.657 42.657 41 41 41H7C5.343 41 4 39.657 4 38V8Z" fill="#2a2f38" stroke="var(--color-border)" stroke-width="1.5"/>
      <path d="M16 24H32M24 16V32" stroke="var(--color-border-light)" stroke-width="2" stroke-linecap="round"/>
    </svg>

    <!-- Error icon -->
    <svg
      v-else-if="icon === 'error'"
      class="empty-state__icon"
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="20" fill="#ef444420" stroke="#ef4444" stroke-width="1.5"/>
      <path d="M24 14V26M24 32V34" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"/>
    </svg>

    <!-- Select icon -->
    <svg
      v-else-if="icon === 'select'"
      class="empty-state__icon"
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <rect x="4" y="8" width="18" height="32" rx="2" fill="var(--color-bg-tertiary)" stroke="var(--color-border)" stroke-width="1.5"/>
      <rect x="26" y="8" width="18" height="32" rx="2" fill="var(--color-bg-secondary)" stroke="var(--color-border)" stroke-width="1.5"/>
      <path d="M34 22L38 26L34 30" stroke="var(--color-accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>

    <!-- Search icon -->
    <svg
      v-else-if="icon === 'search'"
      class="empty-state__icon"
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="21" cy="21" r="12" fill="var(--color-bg-tertiary)" stroke="var(--color-border-light)" stroke-width="1.5"/>
      <path d="M30 30L40 40" stroke="var(--color-accent)" stroke-width="3" stroke-linecap="round"/>
      <path d="M16 21H26" stroke="var(--color-border-light)" stroke-width="2" stroke-linecap="round"/>
    </svg>

    <h3 class="empty-state__title">{{ title }}</h3>
    <p v-if="description" class="empty-state__description">{{ description }}</p>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-6);
  text-align: center;
  max-width: 280px;
}

.empty-state__icon {
  opacity: 0.6;
}

.empty-state__title {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.empty-state__description {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  line-height: 1.5;
}
</style>
