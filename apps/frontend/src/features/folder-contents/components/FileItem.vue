<script setup lang="ts">
import { computed } from "vue"
import type { FileDto } from "@windows-explorer/shared"

const props = defineProps<{
  file: FileDto
}>()

/** Returns a human-readable file size */
function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const units = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const value = bytes / Math.pow(1024, i)
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

/** Maps MIME type to a color-coded icon category */
function getFileCategory(mimeType: string): "image" | "video" | "audio" | "pdf" | "code" | "archive" | "document" | "generic" {
  if (mimeType.startsWith("image/")) return "image"
  if (mimeType.startsWith("video/")) return "video"
  if (mimeType.startsWith("audio/")) return "audio"
  if (mimeType === "application/pdf") return "pdf"
  if (mimeType.includes("zip") || mimeType.includes("tar") || mimeType.includes("rar")) return "archive"
  if (mimeType.includes("word") || mimeType.includes("document")) return "document"
  if (
    mimeType.includes("typescript") ||
    mimeType.includes("javascript") ||
    mimeType === "text/html" ||
    mimeType.includes("json") ||
    mimeType.includes("yaml") ||
    mimeType.includes("markdown") ||
    mimeType === "text/plain"
  ) return "code"
  return "generic"
}

const CATEGORY_COLORS: Record<string, string> = {
  image: "#22c55e",
  video: "#8b5cf6",
  audio: "#f59e0b",
  pdf: "#ef4444",
  code: "#3b82f6",
  archive: "#f97316",
  document: "#06b6d4",
  generic: "#64748b",
}

const category = computed(() => getFileCategory(props.file.mimeType))
const color = computed(() => CATEGORY_COLORS[category.value])
</script>

<template>
  <div class="file-item" role="button" tabindex="0" :aria-label="`File: ${file.name}`">
    <!-- File icon -->
    <div class="file-item__icon">
      <svg
        width="36"
        height="40"
        viewBox="0 0 36 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- Page body -->
        <path
          d="M2 2C2 0.895 2.895 0 4 0H24L34 10V38C34 39.105 33.105 40 32 40H4C2.895 40 2 39.105 2 38V2Z"
          fill="#2a2f38"
          stroke="var(--color-border-light)"
          stroke-width="1"
        />
        <!-- Folded corner -->
        <path d="M24 0L34 10H26C24.895 10 24 9.105 24 8V0Z" fill="var(--color-border-light)" />
        <!-- Color stripe at bottom -->
        <rect x="2" y="30" width="32" height="10" rx="0 0 2 2" :fill="color" opacity="0.8" />
      </svg>

      <!-- Category label -->
      <span class="file-item__category" :style="{ color }">
        {{ category.toUpperCase().slice(0, 3) }}
      </span>
    </div>

    <span class="file-item__name truncate" :title="file.name">
      {{ file.name }}
    </span>
    <span class="file-item__size">{{ formatSize(file.size) }}</span>
  </div>
</template>

<style scoped>
.file-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  cursor: default;
  background-color: transparent;
  border: 1px solid transparent;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast);
  user-select: none;
  outline: none;
  min-width: 80px;
  max-width: 100px;
}

.file-item:hover {
  background-color: var(--color-bg-card-hover);
  border-color: var(--color-border);
}

.file-item:focus-visible {
  box-shadow: 0 0 0 2px var(--color-accent);
  border-color: var(--color-accent);
}

.file-item__icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-item__category {
  position: absolute;
  bottom: 4px;
  font-size: 7px;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.file-item__name {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-align: center;
  line-height: 1.3;
  max-width: 80px;
}

.file-item__size {
  font-size: 10px;
  color: var(--color-text-muted);
}
</style>
