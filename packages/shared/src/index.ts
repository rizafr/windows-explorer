// ─── Folder DTOs ────────────────────────────────────────────────────────────

/** Flat folder record returned from DB */
export interface FolderDto {
    id: string
    name: string
    parentId: string | null
    hasChildren: boolean
    createdAt: string
    updatedAt: string
}

/** Folder node with children — built client-side from FolderDto[] */
export interface FolderNode extends FolderDto {
    children: FolderNode[]
    isExpanded: boolean
}

/** A direct child folder with metadata (used in right panel) */
export interface FolderChildDto {
    id: string
    name: string
    hasChildren: boolean
    createdAt: string
    updatedAt: string
}

// ─── File DTOs ───────────────────────────────────────────────────────────────

export interface FileDto {
    id: string
    folderId: string
    name: string
    size: number
    mimeType: string
    createdAt: string
    updatedAt: string
}

// ─── API Response shapes ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
    data: T
    meta?: PaginationMeta
}

export interface PaginationMeta {
    total: number
    page: number
    perPage: number
}

export interface FolderTreeResponse {
    data: FolderDto[]
}

export interface FolderChildrenResponse {
    data: {
        folders: FolderChildDto[]
        files: FileDto[]
    }
}

export interface SearchResponse {
    data: {
        folders: FolderDto[]
        files: FileDto[]
    }
    meta: {
        total: number
        query: string
    }
}

// ─── Error response ──────────────────────────────────────────────────────────

export interface ApiError {
    error: {
        code: string
        message: string
        statusCode: number
    }
}
