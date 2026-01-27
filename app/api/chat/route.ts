import { chatModel } from "@/lib/ai";
import { authOptions } from "@/lib/auth";
import { createChat, saveMessage } from "@/lib/db/actions";
import { convertToModelMessages, streamText, UIMessage } from "ai";
import { getServerSession } from "next-auth";

export const maxDuration = 30;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const body = await req.json();
  const { messages }: { messages: UIMessage[] } = body;
  const headerChatId = req.headers.get("x-chat-id");

  let chatId = headerChatId || body.chatId;

  if (session?.user?.id) {
    // If no chatId provided, create a new chat record
    if (!chatId) {
      const firstMessageContent =
        messages[0].parts
          ?.filter((p) => p.type === "text")
          .map((p) => (p.type === "text" ? p.text : ""))
          .join("") || "New Conversation";
      const chat = await createChat(session.user.id, firstMessageContent.slice(0, 50));
      chatId = chat.id;
    }

    // Save the user's latest message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === "user") {
      const content =
        lastMessage.parts
          ?.filter((p) => p.type === "text")
          .map((p) => (p.type === "text" ? p.text : ""))
          .join("") || "";
      await saveMessage(chatId, lastMessage.role, content);
    }
  }

  const result = streamText({
    model: chatModel,
    system: "You are a helpful assistant.",
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
