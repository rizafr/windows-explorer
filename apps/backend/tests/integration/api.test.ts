import { describe, it, expect, beforeAll, afterAll } from "bun:test"
import { createApp } from "../../src/app"

/**
 * Integration tests hit the real Elysia app with a real database.
 * Run with: DATABASE_URL=... bun test tests/integration
 *
 * These tests assume the database has been migrated and seeded.
 */

let app: ReturnType<typeof createApp>

beforeAll(() => {
  app = createApp()
})

afterAll(async () => {
  if (app.server) {
    await app.stop()
  }
})

describe("GET /health", () => {
  it("returns 200 with status ok", async () => {
    const res = await app.handle(new Request("http://localhost/health"))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.status).toBe("ok")
    expect(body.timestamp).toBeDefined()
  })
})

describe("GET /api/v1/folders", () => {
  it("returns 200 with an array of folders", async () => {
    const res = await app.handle(new Request("http://localhost/api/v1/folders"))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data).toBeInstanceOf(Array)
    expect(body.data.length).toBeGreaterThan(0)
  })

  it("returns folders with expected shape", async () => {
    const res = await app.handle(new Request("http://localhost/api/v1/folders"))
    const body = await res.json()
    const folder = body.data[0]

    expect(folder).toHaveProperty("id")
    expect(folder).toHaveProperty("name")
    expect(folder).toHaveProperty("parentId")
    expect(folder).toHaveProperty("hasChildren")
    expect(folder).toHaveProperty("createdAt")
    expect(folder).toHaveProperty("updatedAt")
  })
})

describe("GET /api/v1/folders/root", () => {
  it("returns only root-level folders", async () => {
    const res = await app.handle(new Request("http://localhost/api/v1/folders/root"))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data).toBeInstanceOf(Array)
    expect(body.data.length).toBeGreaterThan(0)
  })
})

describe("GET /api/v1/folders/:id/children", () => {
  it("returns 200 with folders and files for a valid folder", async () => {
    // First get a folder that has children
    const listRes = await app.handle(new Request("http://localhost/api/v1/folders"))
    const { data: folders } = await listRes.json()
    const parent = folders.find((f: { hasChildren: boolean }) => f.hasChildren)

    expect(parent).toBeDefined()

    const res = await app.handle(
      new Request(`http://localhost/api/v1/folders/${parent.id}/children`)
    )
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data).toHaveProperty("folders")
    expect(body.data).toHaveProperty("files")
    expect(body.data.folders).toBeInstanceOf(Array)
    expect(body.data.files).toBeInstanceOf(Array)
  })

  it("returns 404 for a non-existent folder", async () => {
    const res = await app.handle(
      new Request(
        "http://localhost/api/v1/folders/00000000-0000-0000-0000-000000000000/children"
      )
    )
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body.error.code).toBe("FOLDER_NOT_FOUND")
  })
})

describe("GET /api/v1/search", () => {
  it("returns folders and files matching the query", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/v1/search?q=Documents")
    )
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.folders).toBeInstanceOf(Array)
    expect(body.data.files).toBeInstanceOf(Array)
    expect(body.meta.query).toBe("Documents")
    expect(body.meta.total).toBeGreaterThanOrEqual(0)
  })

  it("returns empty results for empty query", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/v1/search?q=")
    )
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.folders).toEqual([])
    expect(body.data.files).toEqual([])
    expect(body.meta.total).toBe(0)
  })
})
