import { chatModel } from "@/lib/ai";
import { authOptions } from "@/lib/auth";
import { createChat, findRelevantContent, saveMessage } from "@/lib/db/actions";
import { convertToModelMessages, streamText, UIMessage } from "ai";
import { getServerSession } from "next-auth";

export const maxDuration = 30;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const body = await req.json();
  const { messages }: { messages: UIMessage[] } = body;
  const headerChatId = req.headers.get("x-chat-id");

  let chatId = headerChatId || body.chatId;

  // Extract the text content from the last user message
  const lastUserMessage = messages[messages.length - 1];
  const userQuery =
    lastUserMessage.parts
      ?.filter((p) => p.type === "text")
      .map((p) => (p.type === "text" ? p.text : ""))
      .join("") || "";

  const context = await findRelevantContent(userQuery);

  if (session?.user?.id) {
    if (!chatId) {
      const chat = await createChat(session.user.id, userQuery.slice(0, 50));
      chatId = chat.id;
    }

    if (lastUserMessage.role === "user") {
      await saveMessage(chatId, lastUserMessage.role, userQuery);
    }
  }
  const result = streamText({
    model: chatModel,
    system: `You are a helpful assistant. Use the following pieces of retrieved context to answer the user's question. If you don't know the answer based on the context, say so.
    
    Context:
    ${context}`,
    messages: await convertToModelMessages(messages),
    onFinish: async ({ text }) => {
      if (session?.user?.id && chatId) {
        await saveMessage(chatId, "assistant", text);
      }
    },
  });

  return result.toUIMessageStreamResponse({
    headers: chatId ? { "x-chat-id": chatId } : {},
    onError: (error: unknown) => {
      if (error && typeof error === "object" && "error" in error) {
        const errorDetails = error.error as { message?: string };
        if (errorDetails.message) return errorDetails.message;
      }

      if (error == null) return "unknown error";
      if (typeof error === "string") return error;
      if (error instanceof Error) return error.message;

      return JSON.stringify(error);
    },
  });
}
