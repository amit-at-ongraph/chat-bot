import { DBChat, DBMessage } from "@/types/chat";
import { embed } from "ai";
import { and, desc, eq, gte, lt, or, sql } from "drizzle-orm";
import z from "zod";
import { embeddingModel, queryMetadataSchema } from "../ai";
import { LifecycleState } from "../constants";
import { db } from "./index";
import { ENUM_NAMES, chats, messages, ragChunks, ragEmbeddings } from "./schema";

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
  // Separate lifecycle filter (should always apply) from metadata filters
  const lifecycleFilter = filters[0];
  const metadataFilters = filters.slice(1);

  const scoreSql = buildRetrievalScore(ctx, embeddingJson);

  // Convert the boosted distance score to a similarity scale (1 - distance)
  // Since boosted distance is what we order by, this represents the final match quality.
  const boostedSimilarity = sql<number>`1.0 - ${scoreSql}`;

  // 3. Execute Query
  const relevantChunks = await db
    .select({
      content: ragChunks.content,
      score: scoreSql,
    })
    .from(ragEmbeddings)
    .innerJoin(ragChunks, eq(ragChunks.chunkId, ragEmbeddings.chunkId))
    .where(
      and(
        lifecycleFilter,
        or(
          gte(boostedSimilarity, 0.5), // High quality boosted match -> Ignore strict filters
          metadataFilters.length > 0 ? and(...metadataFilters) : sql`TRUE` // Lower quality -> Apply filters
        )
      )
    )
    .orderBy((t) => t.score)
    .limit(10);

  console.log("Retrieval pipeline results:", relevantChunks, "chunks found");

  return relevantChunks.map((chunk) => chunk.content).join("\n\n");
}

/**
 * Builds the WHERE clause filters based on user context and metadata.
 */
function buildRetrievalFilters(ctx: z.infer<typeof queryMetadataSchema>) {
  const filters = [eq(ragChunks.lifecycleState, LifecycleState.ACTIVE)];

  // Jurisdiction filter (array inclusion)
  if (ctx.jurisdiction && ctx.jurisdiction.length > 0) {
    const jurisdictions = ctx.jurisdiction.map((j) => `'${j}'`).join(",");
    filters.push(
      sql`${ragChunks.jurisdiction} = ANY(ARRAY[${sql.raw(jurisdictions)}]::${sql.raw(ENUM_NAMES.jurisdiction)}[])`,
    );
  }

  // Applicable Roles filter (array intersection)
  if (ctx.applicableRoles && ctx.applicableRoles.length > 0) {
    const roles = ctx.applicableRoles.map((r) => `'${r}'`).join(",");
    filters.push(
      sql`${ragChunks.applicableRoles} && ARRAY[${sql.raw(roles)}]::${sql.raw(ENUM_NAMES.applicable_role)}[]`,
    );
  }

  // Scenario filter (single value)
  if (ctx.scenario) {
    filters.push(eq(ragChunks.scenario, ctx.scenario));
  }

  // Authority Level filter (minimum requirement)
  if (ctx.authorityLevel !== null && ctx.authorityLevel !== undefined) {
    filters.push(gte(ragChunks.authorityLevel, ctx.authorityLevel));
  }

  return filters;
}

function buildRetrievalScore(ctx: z.infer<typeof queryMetadataSchema>, embeddingJson: string) {
  // Base Score: Vector Similarity (Cosine Distance)
  let score = sql<number>`(${ragEmbeddings.embedding} <=> ${embeddingJson})`;

  // Multiply by Retrieval Weight (User-defined importance)
  score = sql`${score} / COALESCE(${ragChunks.retrievalWeight}, 1.0)`;

  // Boost by Authority Level (Lower score = higher authority)
  score = sql`${score} * (1.0 / (1 + COALESCE(${ragChunks.authorityLevel}, 0) * 0.1))`;

  // Boost: Topic Match
  if (ctx.topic) {
    score = sql`
      ${score} * (
        CASE 
          WHEN ${ragChunks.topic} = ${ctx.topic} 
          THEN 0.90 
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
          WHEN ${ragChunks.lexicalTriggers} && ARRAY[${sql.raw(triggers)}]::text[] 
          THEN 0.85
          ELSE 1.0 
        END
      )`;
  }

  // Boost: Recency / Freshness
  score = sql`
    ${score} * (
      CASE
        WHEN ${ragChunks.lastReviewed} IS NULL THEN 1.0
        WHEN ${ragChunks.lastReviewed} >= NOW() - INTERVAL '180 days' THEN 0.80
        WHEN ${ragChunks.lastReviewed} >= NOW() - INTERVAL '365 days' THEN 0.90
        WHEN ${ragChunks.lastReviewed} >= NOW() - INTERVAL '730 days' THEN 1.00
        ELSE 1.20
      END
    )`;

  return score;
}
