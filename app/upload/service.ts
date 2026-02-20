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
  authorityLevel?: number;
  sourceIds?: string[];
  retrievalWeight?: number;
}

export const chunkService = {
  fetchAll: async (filters: Record<string, string>) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const { data } = await axios.get(`/api/chunks?${params.toString()}`);
    return (data.chunks as Chunk[]) || [];
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
