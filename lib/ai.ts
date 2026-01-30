import { openai } from "@ai-sdk/openai";

export const chatModel = openai("gpt-3.5-turbo");
export const embeddingModel = openai.embedding("text-embedding-3-small");
