import { DBChat, DBMessage } from "@/types/chat";
import { desc, eq } from "drizzle-orm";
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

export async function getChatMessages(chatId: string): Promise<DBMessage[]> {
  return await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId))
    .orderBy(messages.createdAt);
}

export async function getUserChats(userId: string): Promise<DBChat[]> {
  return await db
    .select()
    .from(chats)
    .where(eq(chats.userId, userId))
    .orderBy(desc(chats.createdAt));
}
