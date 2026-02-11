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

  toggleStatus: async (chunkId: string, status: string) => {
    await axios.post("/api/chunks/toggle", { chunkId, status });
  },

  delete: async (chunkId: string) => {
    await axios.delete(`/api/chunks?chunkId=${chunkId}`);
  },
};
