import { streamText } from 'ai';
import { chatModel } from '@/lib/ai';

export const runtime = 'edge';

export async function POST(req: Request): Promise<Response> {
  const { messages }: { messages: Array<{ role: 'user' | 'assistant'; content: string }> } =
    await req.json();

  const result = await streamText({
    model: chatModel,
    // messages,
    prompt: messages[0].content,
    system: 'You are a helpful AI chatbot.',
  });

  console.log(result)

  return result.toTextStreamResponse();
}
