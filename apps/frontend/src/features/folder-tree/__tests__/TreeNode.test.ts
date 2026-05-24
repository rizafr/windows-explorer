import { describe, it, expect, vi, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import TreeNode from "@/features/folder-tree/components/TreeNode.vue"
import { useExplorerStore } from "@/features/explorer/store/explorer.store"
import type { FolderNode } from "@windows-explorer/shared"

function makeNode(overrides: Partial<FolderNode> = {}): FolderNode {
  return {
    id: "test-id",
    name: "Documents",
    parentId: null,
    hasChildren: false,
    children: [],
    isExpanded: false,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
    ...overrides,
  }
}

describe("TreeNode", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it("renders the folder name", () => {
    const wrapper = mount(TreeNode, {
      props: { node: makeNode({ name: "My Documents" }), depth: 0 },
    })
    expect(wrapper.text()).toContain("My Documents")
  })

  it("does not show chevron for leaf nodes", () => {
    const wrapper = mount(TreeNode, {
      props: { node: makeNode({ hasChildren: false }), depth: 0 },
    })
    // No chevron SVG should be present
    expect(wrapper.find(".chevron:not(.chevron--empty)").exists()).toBe(false)
  })

  it("shows chevron for nodes with children", () => {
    const wrapper = mount(TreeNode, {
      props: {
        node: makeNode({ hasChildren: true, children: [makeNode({ id: "child" })] }),
        depth: 0,
      },
    })
    expect(wrapper.find(".chevron").exists()).toBe(true)
  })

  it("applies correct indentation based on depth", () => {
    const wrapper = mount(TreeNode, {
      props: { node: makeNode(), depth: 3 },
    })
    const row = wrapper.find(".tree-node__row")
    // depth 3 → paddingLeft = 3*20 + 8 = 68px
    expect(row.attributes("style")).toContain("68px")
  })

  it("calls store.selectFolder on click", async () => {
    const store = useExplorerStore()
    const spy = vi.spyOn(store, "selectFolder")

    const wrapper = mount(TreeNode, {
      props: { node: makeNode({ id: "folder-123" }), depth: 0 },
    })

    await wrapper.find(".tree-node__row").trigger("click")
    expect(spy).toHaveBeenCalledWith("folder-123")
  })

  it("marks row as selected when store has it selected", async () => {
    const store = useExplorerStore()
    store.selectFolder("test-id")

    const wrapper = mount(TreeNode, {
      props: { node: makeNode({ id: "test-id" }), depth: 0 },
    })

    expect(wrapper.find(".tree-node__row--selected").exists()).toBe(true)
  })

  it("renders child TreeNode components when expanded", async () => {
    const childNode = makeNode({ id: "child-1", name: "Child Folder" })
    const parentNode = makeNode({
      id: "parent-1",
      hasChildren: true,
      children: [childNode],
    })
    const store = useExplorerStore()
    store.expandFolder("parent-1")

    const wrapper = mount(TreeNode, {
      props: { node: parentNode, depth: 0 },
    })

    expect(wrapper.text()).toContain("Child Folder")
  })

  it("does not render children when not expanded", () => {
    const childNode = makeNode({ id: "child-1", name: "Hidden Child" })
    const parentNode = makeNode({
      id: "parent-1",
      hasChildren: true,
      children: [childNode],
    })

    const wrapper = mount(TreeNode, {
      props: { node: parentNode, depth: 0 },
    })

    expect(wrapper.text()).not.toContain("Hidden Child")
  })

  it("has correct ARIA attributes", () => {
    const node = makeNode({ hasChildren: true })
    const wrapper = mount(TreeNode, {
      props: { node, depth: 0 },
    })

    const li = wrapper.find("li")
    expect(li.attributes("role")).toBe("treeitem")
    expect(li.attributes("aria-expanded")).toBeDefined()
    expect(li.attributes("aria-selected")).toBeDefined()
  })
})
