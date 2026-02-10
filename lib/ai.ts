import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { ApplicableRole, Jurisdiction, Scope } from "./constants";

export const chatModel = openai("gpt-3.5-turbo");
export const embeddingModel = openai.embedding("text-embedding-3-small");

export const queryMetadataSchema = z.object({
  topic: z.string().nullable(),

  jurisdiction: z.array(z.enum(Jurisdiction)).nullable(),

  scope: z.enum(Scope).nullable(),

  applicableRoles: z.array(z.enum(ApplicableRole)).nullable(),

  lexicalTriggers: z.array(z.string()),

  authorityLevel: z.number().nullable(),

  retrievalWeight: z.number().nullable(),

  intent: z.enum(["definition", "explanation", "comparison", "procedure", "warning"]).nullable(),
});

export async function extractQueryMetadata(
  query: string,
): Promise<z.infer<typeof queryMetadataSchema>> {
  const chatModel = openai("gpt-4.1-mini");

  const { object } = await generateObject({
    model: chatModel,
    schema: queryMetadataSchema,
    system: `
You are a query metadata extractor for a RAG system.
Do NOT answer the question.
Return ONLY structured metadata.
Lexical triggers must be exact substrings from the user query.
`,
    prompt: `User query: "${query}"`,
  });

  return object;
}
