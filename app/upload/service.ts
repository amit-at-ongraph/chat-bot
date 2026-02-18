import axios from "axios";

export interface Chunk {
  chunkId: string;
  content: string;
  topic?: string;
  scenario?: string;
  jurisdiction?: string;
  lifecycleState?: string;
  createdAt: string;
  applicableRoles?: string[];
  lastReviewed?: string;
  lexicalTriggers?: string[];
}

export interface PaginatedResult<T> {
  chunks: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const chunkService = {
  fetchAll: async (filters: Record<string, string>, page = 1, limit = 20, query: string = "") => {
    const params = new URLSearchParams();
    if (query) params.append("query", query);
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const { data } = await axios.get(`/api/chunks?${params.toString()}`);
    return data as PaginatedResult<Chunk>;
  },

  fetchOne: async (chunkId: string) => {
    const { data } = await axios.get(`/api/chunks/${chunkId}`);
    return data.chunk as Chunk;
  },

  updateMetadata: async (chunkId: string, metadata: Partial<Chunk>) => {
    await axios.patch(`/api/chunks/${chunkId}/metadata`, metadata);
  },

  updateContent: async (chunkId: string, content: string) => {
    await axios.patch(`/api/chunks/${chunkId}/content`, { content });
  },

  toggleStatus: async (chunkId: string, status: string) => {
    await axios.post("/api/chunks/toggle", { chunkId, status });
  },

  delete: async (chunkId: string) => {
    await axios.delete(`/api/chunks?chunkId=${chunkId}`);
  },
};
