import { MODE_CLASSIFIER_PROMPT } from "@/config/behaviour";
import { chatModel } from "@/lib/ai";
import { authOptions } from "@/lib/auth";
import { createChat, findRelevantContent, saveMessage } from "@/lib/db/actions";
import { getSystemMessage } from "@/lib/prompts";
import { convertToModelMessages, generateText, streamText, UIMessage } from "ai";
import { getServerSession } from "next-auth";

export const maxDuration = 30;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const body = await req.json();
  const { messages }: { messages: UIMessage[] } = body;
  const headerChatId = req.headers.get("x-chat-id");
  const language = req.headers.get("x-language") || "en";
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

  const mode = await detectModeWithLLM(userQuery);

  const systemPrompt = getSystemMessage(context, mode, language);

  const result = streamText({
    model: chatModel,
    system: systemPrompt,
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

export type Mode = "CRISIS" | "OPERATIONS" | "INFORMATION";

async function detectModeWithLLM(userQuery: string): Promise<Mode> {
  const { text } = await generateText({
    model: chatModel,
    system: MODE_CLASSIFIER_PROMPT,
    prompt: userQuery,
    temperature: 0,
  });

  const label = text.trim();

  if (label === "CRISIS" || label === "OPERATIONS" || label === "INFORMATION") {
    return label;
  }

  // Safety fallback
  return "INFORMATION";
}
