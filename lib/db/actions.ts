import { DBChat, DBMessage } from "@/types/chat";
import { and, desc, eq, lt, or } from "drizzle-orm";
import { db } from "./index";
import { chats, messages } from "./schema";

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
