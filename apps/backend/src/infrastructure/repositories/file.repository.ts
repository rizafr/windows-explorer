import { eq, sql } from "drizzle-orm"
import type { Database } from "../db/client"
import { files } from "../db/schema"
import type { IFileRepository } from "../../application/repositories/file.repository.interface"
import type { FileDto } from "@windows-explorer/shared"

export class DrizzleFileRepository implements IFileRepository {
  constructor(private readonly db: Database) {}

  /**
   * Fetches all files within a folder, ordered alphabetically.
   */
  async findByFolderId(folderId: string): Promise<FileDto[]> {
    const rows = await this.db
      .select()
      .from(files)
      .where(eq(files.folderId, folderId))
      .orderBy(files.name)

    return rows.map(this.mapToDto)
  }

  /**
   * Case-insensitive partial-match search on file names.
   */
  async search(query: string): Promise<FileDto[]> {
    const rows = await this.db.execute<{
      id: string
      folder_id: string
      name: string
      size: string
      mime_type: string
      created_at: string
      updated_at: string
    }>(sql`
      SELECT id, folder_id, name, size, mime_type, created_at, updated_at
      FROM files
      WHERE name ILIKE ${"%" + query + "%"}
      ORDER BY name ASC
      LIMIT 100
    `)

    return rows.map((row) => ({
      id: row.id,
      folderId: row.folder_id,
      name: row.name,
      size: Number(row.size),
      mimeType: row.mime_type,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  }

  // ─── Mapper ────────────────────────────────────────────────────────────────

  private mapToDto(row: typeof files.$inferSelect): FileDto {
    return {
      id: row.id,
      folderId: row.folderId,
      name: row.name,
      size: Number(row.size),
      mimeType: row.mimeType,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }
  }
}
