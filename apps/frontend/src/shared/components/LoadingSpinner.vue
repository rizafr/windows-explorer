<script setup lang="ts">
defineProps<{
  label?: string
}>()
</script>

<template>
  <div class="loading-spinner" role="status" :aria-label="label ?? 'Loading...'">
    <svg
      class="spinner"
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="14" cy="14" r="11" stroke="var(--color-border)" stroke-width="2.5" />
      <path
        d="M14 3A11 11 0 0125 14"
        stroke="var(--color-accent)"
        stroke-width="2.5"
        stroke-linecap="round"
      />
    </svg>
    <span v-if="label" class="loading-spinner__label">{{ label }}</span>
  </div>
</template>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.spinner {
  animation: spin 0.8s linear infinite;
}

.loading-spinner__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
