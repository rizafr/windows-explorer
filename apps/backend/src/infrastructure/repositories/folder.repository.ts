import { eq, sql } from "drizzle-orm"
import type { Database } from "../db/client"
import { folders } from "../db/schema"
import type { IFolderRepository } from "../../application/repositories/folder.repository.interface"
import type { FolderDto, FolderChildDto } from "@windows-explorer/shared"

export class DrizzleFolderRepository implements IFolderRepository {
  constructor(private readonly db: Database) {}

  /**
   * Fetches ALL folders as a flat list.
   * Uses a subquery to compute `hasChildren` in a single DB round-trip.
   */
  async findAll(): Promise<FolderDto[]> {
    const rows = await this.db.execute<{
      id: string
      name: string
      parent_id: string | null
      has_children: boolean
      created_at: string
      updated_at: string
    }>(sql`
      SELECT
        f.id,
        f.name,
        f.parent_id,
        EXISTS (
          SELECT 1 FROM folders c WHERE c.parent_id = f.id
        ) AS has_children,
        f.created_at,
        f.updated_at
      FROM folders f
      ORDER BY f.name ASC
    `)

    return rows.map(this.mapToDto)
  }

  /**
   * Fetches direct children of a folder.
   */
  async findChildren(folderId: string): Promise<FolderChildDto[]> {
    const rows = await this.db.execute<{
      id: string
      name: string
      has_children: boolean
      created_at: string
      updated_at: string
    }>(sql`
      SELECT
        f.id,
        f.name,
        EXISTS (
          SELECT 1 FROM folders c WHERE c.parent_id = f.id
        ) AS has_children,
        f.created_at,
        f.updated_at
      FROM folders f
      WHERE f.parent_id = ${folderId}
      ORDER BY f.name ASC
    `)

    return rows.map(this.mapToChildDto)
  }

  /**
   * Fetches root-level folders (parentId IS NULL).
   */
  async findRoots(): Promise<FolderChildDto[]> {
    const rows = await this.db.execute<{
      id: string
      name: string
      has_children: boolean
      created_at: string
      updated_at: string
    }>(sql`
      SELECT
        f.id,
        f.name,
        EXISTS (
          SELECT 1 FROM folders c WHERE c.parent_id = f.id
        ) AS has_children,
        f.created_at,
        f.updated_at
      FROM folders f
      WHERE f.parent_id IS NULL
      ORDER BY f.name ASC
    `)

    return rows.map(this.mapToChildDto)
  }

  /**
   * Checks if a folder with the given ID exists.
   */
  async exists(folderId: string): Promise<boolean> {
    const [row] = await this.db
      .select({ id: folders.id })
      .from(folders)
      .where(eq(folders.id, folderId))
      .limit(1)

    return row !== undefined
  }

  /**
   * Case-insensitive partial-match search on folder names.
   */
  async search(query: string): Promise<FolderDto[]> {
    const rows = await this.db.execute<{
      id: string
      name: string
      parent_id: string | null
      has_children: boolean
      created_at: string
      updated_at: string
    }>(sql`
      SELECT
        f.id,
        f.name,
        f.parent_id,
        EXISTS (
          SELECT 1 FROM folders c WHERE c.parent_id = f.id
        ) AS has_children,
        f.created_at,
        f.updated_at
      FROM folders f
      WHERE f.name ILIKE ${"%" + query + "%"}
      ORDER BY f.name ASC
      LIMIT 100
    `)

    return rows.map(this.mapToDto)
  }

  // ─── Mappers ───────────────────────────────────────────────────────────────

  private mapToDto(row: {
    id: string
    name: string
    parent_id: string | null
    has_children: boolean
    created_at: string
    updated_at: string
  }): FolderDto {
    return {
      id: row.id,
      name: row.name,
      parentId: row.parent_id,
      hasChildren: row.has_children,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  private mapToChildDto(row: {
    id: string
    name: string
    has_children: boolean
    created_at: string
    updated_at: string
  }): FolderChildDto {
    return {
      id: row.id,
      name: row.name,
      hasChildren: row.has_children,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }
}
