<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"
import FolderTree from "@/features/folder-tree/components/FolderTree.vue"
import RightPanel from "@/features/folder-contents/components/RightPanel.vue"
import SearchBar from "@/features/search/components/SearchBar.vue"
import { useFolderTree } from "@/features/folder-tree/composables/useFolderTree"
import { useFolderChildren } from "@/features/folder-contents/composables/useFolderChildren"

// Initialize composables (they wire up the store internally)
useFolderTree()
useFolderChildren()

// ─── Resizable splitter ──────────────────────────────────────────────────────
const LEFT_MIN = 180
const LEFT_MAX = 600

const leftWidth = ref(280)
const isDragging = ref(false)
const startX = ref(0)
const startWidth = ref(0)

function onSplitterMouseDown(event: MouseEvent) {
  isDragging.value = true
  startX.value = event.clientX
  startWidth.value = leftWidth.value
  document.body.style.cursor = "col-resize"
  document.body.style.userSelect = "none"
}

function onMouseMove(event: MouseEvent) {
  if (!isDragging.value) return
  const delta = event.clientX - startX.value
  leftWidth.value = Math.min(LEFT_MAX, Math.max(LEFT_MIN, startWidth.value + delta))
}

function onMouseUp() {
  if (!isDragging.value) return
  isDragging.value = false
  document.body.style.cursor = ""
  document.body.style.userSelect = ""
}

onMounted(() => {
  window.addEventListener("mousemove", onMouseMove)
  window.addEventListener("mouseup", onMouseUp)
})

onUnmounted(() => {
  window.removeEventListener("mousemove", onMouseMove)
  window.removeEventListener("mouseup", onMouseUp)
})
</script>

<template>
  <div class="app-shell">
    <!-- Title bar -->
    <header class="app-shell__titlebar" role="banner">
      <div class="app-shell__window-controls" aria-hidden="true">
        <span class="window-btn window-btn--close" />
        <span class="window-btn window-btn--minimize" />
        <span class="window-btn window-btn--maximize" />
      </div>

      <div class="app-shell__title">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="6" height="6" rx="1" fill="var(--color-accent)" opacity="0.8"/>
          <rect x="9" y="1" width="6" height="6" rx="1" fill="var(--color-accent)" opacity="0.6"/>
          <rect x="1" y="9" width="6" height="6" rx="1" fill="var(--color-accent)" opacity="0.6"/>
          <rect x="9" y="9" width="6" height="6" rx="1" fill="var(--color-accent)" opacity="0.4"/>
        </svg>
        <span>Windows Explorer | Riza Fauzi Rahman</span>
      </div>
    </header>

    <!-- Toolbar -->
    <div class="app-shell__toolbar" role="toolbar" aria-label="Explorer toolbar">
      <nav class="app-shell__nav-buttons" aria-label="Navigation">
        <button class="toolbar-btn" type="button" disabled aria-label="Go back">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M8 2L4 6L8 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button class="toolbar-btn" type="button" disabled aria-label="Go forward">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M4 2L8 6L4 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button class="toolbar-btn" type="button" disabled aria-label="Go up">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 9V3M3 6L6 3L9 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </nav>

      <SearchBar />
    </div>

    <!-- Main split-panel area -->
    <main class="app-shell__main" role="main">
      <!-- Left panel — folder tree -->
      <aside
        class="app-shell__left-panel"
        :style="{ width: `${leftWidth}px`, minWidth: `${leftWidth}px` }"
        aria-label="Folder tree navigation"
      >
        <div class="panel-header">
          <span class="panel-header__title">Folders</span>
        </div>
        <FolderTree />
      </aside>

      <!-- Resizable splitter -->
      <div
        class="app-shell__splitter"
        :class="{ 'app-shell__splitter--dragging': isDragging }"
        role="separator"
        aria-label="Resize panels"
        aria-orientation="vertical"
        tabindex="0"
        @mousedown="onSplitterMouseDown"
      />

      <!-- Right panel — folder/file contents -->
      <div class="app-shell__right-panel">
        <RightPanel />
      </div>
    </main>

    <!-- Status bar -->
    <footer class="app-shell__statusbar" role="contentinfo">
      <span>Riza Fauzi Rahman</span>
      <span class="app-shell__statusbar-sep" />
      <span>Windows Explorer</span>
    </footer>
  </div>
</template>

<style scoped>
.app-shell {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-primary);
}

/* ─── Title bar ─────────────────────────────────────────────────────────────── */
.app-shell__titlebar {
  height: var(--titlebar-height);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: 0 var(--space-4);
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  -webkit-app-region: drag;
}

.app-shell__window-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  -webkit-app-region: no-drag;
}

.window-btn {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}
.window-btn--close { background-color: #ff5f57; }
.window-btn--minimize { background-color: #ffbd2e; }
.window-btn--maximize { background-color: #28c840; }

.app-shell__title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  flex: 1;
  justify-content: center;
  -webkit-app-region: no-drag;
}

/* ─── Toolbar ───────────────────────────────────────────────────────────────── */
.app-shell__toolbar {
  height: var(--toolbar-height);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 0 var(--space-4);
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.app-shell__nav-buttons {
  display: flex;
  align-items: center;
  gap: 2px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--color-text-muted);
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.toolbar-btn:hover:not(:disabled) {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.toolbar-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* ─── Main split area ────────────────────────────────────────────────────────── */
.app-shell__main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.app-shell__left-panel {
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  overflow: hidden;
  flex-shrink: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  padding: var(--space-2) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.panel-header__title {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.app-shell__splitter {
  width: 4px;
  background-color: var(--color-border);
  cursor: col-resize;
  flex-shrink: 0;
  transition: background-color var(--transition-fast);
  position: relative;
}

.app-shell__splitter::after {
  content: '';
  position: absolute;
  inset: 0 -4px;
}

.app-shell__splitter:hover,
.app-shell__splitter--dragging {
  background-color: var(--color-accent);
}

.app-shell__right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ─── Status bar ─────────────────────────────────────────────────────────────── */
.app-shell__statusbar {
  height: var(--statusbar-height);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 0 var(--space-4);
  background-color: var(--color-bg-selected);
  font-size: var(--font-size-xs);
  color: rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
}

.app-shell__statusbar-sep {
  width: 1px;
  height: 12px;
  background-color: rgba(255, 255, 255, 0.3);
}
</style>
