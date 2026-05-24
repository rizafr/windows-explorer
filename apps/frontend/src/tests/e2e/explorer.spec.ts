import { test, expect } from "@playwright/test"

test.describe("Windows Explorer E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    // Wait for the folder tree to load
    await page.waitForSelector(".folder-tree__list", { timeout: 10_000 })
  })

  test("displays the application title", async ({ page }) => {
    await expect(page.locator(".app-shell__title")).toContainText("Windows Explorer")
  })

  test("loads and displays the folder tree on initial load", async ({ page }) => {
    const treeItems = page.locator(".tree-node__row")
    await expect(treeItems.first()).toBeVisible()
    expect(await treeItems.count()).toBeGreaterThan(0)
  })

  test("right panel shows empty state before selecting a folder", async ({ page }) => {
    await expect(page.getByText("Select a folder")).toBeVisible()
  })

  test("clicking a folder shows its children in the right panel", async ({ page }) => {
    // Click the first root folder
    const firstFolder = page.locator(".tree-node__row").first()
    const folderName = await firstFolder.locator(".tree-node__name").textContent()
    await firstFolder.click()

    // Right panel header should appear
    await expect(page.locator(".right-panel__breadcrumb")).toContainText(folderName ?? "")
  })

  test("can expand a folder with children", async ({ page }) => {
    // Find a row that has a chevron (has children)
    const expandableRow = page.locator(".tree-node__row--has-children").first()
    await expandableRow.click()

    // Children should become visible
    const childList = page.locator(".tree-node__children").first()
    await expect(childList).toBeVisible()
  })

  test("search bar filters folders and files", async ({ page }) => {
    const searchInput = page.locator("#search-input")
    await searchInput.fill("Documents")

    // Wait for dropdown to appear
    await expect(page.locator(".search-bar__results")).toBeVisible()

    // Should have at least one result
    await expect(page.locator(".search-bar__result-item").first()).toBeVisible()
  })

  test("clearing search hides the results dropdown", async ({ page }) => {
    const searchInput = page.locator("#search-input")
    await searchInput.fill("Documents")
    await expect(page.locator(".search-bar__results")).toBeVisible()

    await page.locator(".search-bar__clear").click()
    await expect(page.locator(".search-bar__results")).not.toBeVisible()
  })

  test("right panel shows subfolders for a folder with children", async ({ page }) => {
    // Click a folder that has children (Documents)
    const docFolder = page.locator(".tree-node__name").filter({ hasText: "Documents" }).first()
    await docFolder.click()

    // Wait for right panel to populate
    await page.waitForSelector(".right-panel__section", { timeout: 5000 })
    const items = page.locator(".folder-item, .file-item")
    expect(await items.count()).toBeGreaterThan(0)
  })

  test("resizable splitter can be dragged", async ({ page }) => {
    const splitter = page.locator(".app-shell__splitter")
    const leftPanel = page.locator(".app-shell__left-panel")

    const beforeWidth = await leftPanel.evaluate((el) => el.getBoundingClientRect().width)
    const splitterBox = await splitter.boundingBox()

    if (splitterBox) {
      await page.mouse.move(splitterBox.x, splitterBox.y + splitterBox.height / 2)
      await page.mouse.down()
      await page.mouse.move(splitterBox.x + 80, splitterBox.y + splitterBox.height / 2)
      await page.mouse.up()
    }

    const afterWidth = await leftPanel.evaluate((el) => el.getBoundingClientRect().width)
    expect(afterWidth).toBeGreaterThan(beforeWidth)
  })
})
