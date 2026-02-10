import { DBChat, DBMessage } from "@/types/chat";
import { embed } from "ai";
import { and, desc, eq, gte, lt, or, sql } from "drizzle-orm";
import z from "zod";
import { embeddingModel, queryMetadataSchema } from "../ai";
import { LifecycleState } from "../constants";
import { db } from "./index";
import {
  ENUM_NAMES,
  chats,
  messages,
  ragChunks,
  ragEmbeddings,
  ragMetadata,
} from "./schema";

export async function createChat(userId: string, title?: string): Promise<DBChat> {
  const [newChat] = await db
    .insert(chats)
    .values({
      userId,
      title: title || "New Conversation",
    })
    .returning();
  return newChat;
}

export async function saveMessage(
  chatId: string,
  role: string,
  content: string,
): Promise<DBMessage> {
  const [newMessage] = await db
    .insert(messages)
    .values({
      chatId,
      role,
      content,
    })
    .returning();
  return newMessage;
}

export async function getChatMessages(
  chatId: string,
  date: Date,
  cursorId: string,
  limit = 20,
): Promise<DBMessage[]> {
  let whereCondition;

  if (cursorId) {
    whereCondition = and(
      eq(messages.chatId, chatId),
      or(
        lt(messages.createdAt, date),
        and(eq(messages.createdAt, date), lt(messages.id, cursorId)),
      ),
    );
  } else {
    whereCondition = eq(messages.chatId, chatId);
  }

  return await db
    .select()
    .from(messages)
    .where(whereCondition)
    .orderBy(desc(messages.createdAt), desc(messages.id))
    .limit(limit);
}

export async function getUserChats(userId: string): Promise<DBChat[]> {
  return await db
    .select()
    .from(chats)
    .where(eq(chats.userId, userId))
    .orderBy(desc(chats.createdAt));
}

export async function deleteChat(chatId: string) {
  return await db.delete(chats).where(eq(chats.id, chatId));
}

export async function renameChat(chatId: string, title: string) {
  return await db.update(chats).set({ title }).where(eq(chats.id, chatId)).returning();
}

/**
 * Pipeline-based context retrieval system.
 */
export async function findRelevantContent(
  userQuery: string,
  ctx: z.infer<typeof queryMetadataSchema>,
) {
  if (!userQuery) return "";

  // 1. Generate embedding for query
  const { embedding } = await embed({
    model: embeddingModel,
    value: userQuery,
  });

  const embeddingJson = JSON.stringify(embedding);

  // 2. Build Pipeline Components
  const filters = buildRetrievalFilters(ctx);
  const scoreSql = buildRetrievalScore(ctx, embeddingJson);

  // 3. Execute Query
  const relevantChunks = await db
    .select({
      content: ragChunks.content,
      score: scoreSql,
    })
    .from(ragEmbeddings)
    .innerJoin(ragChunks, eq(ragChunks.chunkId, ragEmbeddings.chunkId))
    .innerJoin(ragMetadata, eq(ragMetadata.id, ragEmbeddings.metadataId))
    .where(and(...filters))
    .orderBy((t) => t.score)
    .limit(10);

  console.log("Retrieval pipeline results:", relevantChunks, "chunks found");

  return relevantChunks.map((chunk) => chunk.content).join("\n\n");
}

/**
 * Builds the WHERE clause filters based on user context and metadata.
 */
function buildRetrievalFilters(ctx: z.infer<typeof queryMetadataSchema>) {
  const filters = [eq(ragMetadata.lifecycleState, LifecycleState.ACTIVE)];

  // Jurisdiction filter (array inclusion)
  if (ctx.jurisdiction && ctx.jurisdiction.length > 0) {
    const jurisdictions = ctx.jurisdiction.map((j) => `'${j}'`).join(",");
    filters.push(
      sql`${ragMetadata.jurisdiction} = ANY(ARRAY[${sql.raw(jurisdictions)}]::${sql.raw(ENUM_NAMES.jurisdiction)}[])`,
    );
  }

  // Applicable Roles filter (array intersection)
  if (ctx.applicableRoles && ctx.applicableRoles.length > 0) {
    const roles = ctx.applicableRoles.map((r) => `'${r}'`).join(",");
    filters.push(
      sql`${ragMetadata.applicableRoles} && ARRAY[${sql.raw(roles)}]::${sql.raw(ENUM_NAMES.applicable_role)}[]`,
    );
  }

  // Scenario filter (single value)
  if (ctx.scenario) {
    filters.push(eq(ragMetadata.scenario, ctx.scenario));
  }

  // Authority Level filter (minimum requirement)
  if (ctx.authorityLevel !== null && ctx.authorityLevel !== undefined) {
    filters.push(gte(ragMetadata.authorityLevel, ctx.authorityLevel));
  }

  return filters;
}


function buildRetrievalScore(ctx: z.infer<typeof queryMetadataSchema>, embeddingJson: string) {
  // Base Score: Vector Similarity (Cosine Distance)
  let score = sql<number>`(${ragEmbeddings.embedding} <=> ${embeddingJson})`;

  // Multiply by Retrieval Weight (User-defined importance)
  score = sql`${score} * COALESCE(${ragMetadata.retrievalWeight}, 1.0)`;

  // Boost by Authority Level (Lower score = higher authority)
  score = sql`${score} * (1.0 / (1 + COALESCE(${ragMetadata.authorityLevel}, 0) * 0.1))`;

  // Boost: Topic Match
  if (ctx.topic) {
    score = sql`
      ${score} * (
        CASE 
          WHEN ${ragMetadata.topic} = ${ctx.topic} 
          THEN 1.1 
          ELSE 1.0 
        END
      )`;
  }

  // Boost: Lexical Triggers (Keywords)
  if (ctx.lexicalTriggers && ctx.lexicalTriggers.length > 0) {
    const triggers = ctx.lexicalTriggers.map((t) => `'${t}'`).join(",");
    score = sql`
      ${score} * (
        CASE 
          WHEN ${ragMetadata.lexicalTriggers} && ARRAY[${sql.raw(triggers)}]::text[] 
          THEN 1.15 
          ELSE 1.0 
        END
      )`;
  }

  return score;
}
