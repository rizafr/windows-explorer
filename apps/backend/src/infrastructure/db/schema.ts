import {
  pgTable,
  uuid,
  text,
  bigint,
  timestamp,
  index,
} from "drizzle-orm/pg-core"
import { relations, type AnyColumn } from "drizzle-orm"

// ─── Folders ─────────────────────────────────────────────────────────────────

export const folders = pgTable(
  "folders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    parentId: uuid("parent_id").references((): AnyColumn => folders.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // Fast child lookup — most frequent query
    index("idx_folders_parent_id").on(table.parentId),
    // Full-text search on folder names
    index("idx_folders_name").on(table.name),
  ]
)

export const foldersRelations = relations(folders, ({ one, many }) => ({
  parent: one(folders, {
    fields: [folders.parentId],
    references: [folders.id],
    relationName: "folder_hierarchy",
  }),
  children: many(folders, {
    relationName: "folder_hierarchy",
  }),
  files: many(files),
}))

// ─── Files ────────────────────────────────────────────────────────────────────

export const files = pgTable(
  "files",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    folderId: uuid("folder_id")
      .notNull()
      .references(() => folders.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    // Size in bytes; bigint supports files up to 9 exabytes
    size: bigint("size", { mode: "number" }).notNull().default(0),
    mimeType: text("mime_type").notNull().default("application/octet-stream"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // Fast file lookup by folder
    index("idx_files_folder_id").on(table.folderId),
    // Search support
    index("idx_files_name").on(table.name),
  ]
)

export const filesRelations = relations(files, ({ one }) => ({
  folder: one(folders, {
    fields: [files.folderId],
    references: [folders.id],
  }),
}))

// ─── Type exports ─────────────────────────────────────────────────────────────

export type Folder = typeof folders.$inferSelect
export type NewFolder = typeof folders.$inferInsert

export type File = typeof files.$inferSelect
export type NewFile = typeof files.$inferInsert
