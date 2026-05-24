import { describe, expect, it } from "bun:test"
import { normalizeDatabaseUrl } from "../../src/infrastructure/db/connection-string"

describe("normalizeDatabaseUrl", () => {
  it("removes the database query parameter when a database path exists", () => {
    const url = normalizeDatabaseUrl(
      "postgres://explorer:secret@localhost:5433/windows_explorer?database=ignored&sslmode=require",
    )

    expect(url).toBe(
      "postgres://explorer:secret@localhost:5433/windows_explorer?sslmode=require",
    )
  })

  it("uses the database query parameter as the path when no path exists", () => {
    const url = normalizeDatabaseUrl(
      "postgres://explorer:secret@localhost:5433?database=windows_explorer",
    )

    expect(url).toBe(
      "postgres://explorer:secret@localhost:5433/windows_explorer",
    )
  })

  it("leaves non-url connection strings unchanged", () => {
    expect(normalizeDatabaseUrl("")).toBe("")
  })
})
