import { apiClient } from "./client"
import type {
  FolderTreeResponse,
  FolderChildrenResponse,
  SearchResponse,
} from "@windows-explorer/shared"

/**
 * All API calls related to folders and search.
 * Each function returns strongly-typed response data.
 */
export const foldersApi = {
  /**
   * Fetch the complete flat folder tree.
   */
  async getTree(): Promise<FolderTreeResponse> {
    const { data } = await apiClient.get<FolderTreeResponse>("/folders")
    return data
  },

  /**
   * Fetch direct children (folders + files) of a folder.
   */
  async getChildren(folderId: string): Promise<FolderChildrenResponse> {
    const { data } = await apiClient.get<FolderChildrenResponse>(
      `/folders/${folderId}/children`
    )
    return data
  },

  /**
   * Search folders and files by name.
   */
  async search(query: string): Promise<SearchResponse> {
    const { data } = await apiClient.get<SearchResponse>("/search", {
      params: { q: query },
    })
    return data
  },
}
