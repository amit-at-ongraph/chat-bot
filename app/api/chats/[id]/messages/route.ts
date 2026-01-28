import { authOptions } from "@/lib/auth";
import { getChatMessages } from "@/lib/db/actions";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = parseInt(searchParams.get("limit") || "20");

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { date, cursorId } = paginateCursor.decoder(cursor || "");
    const messages = await getChatMessages(id, date, cursorId, limit);

    // Calculate the next cursor based on the last message fetched
    const lastMessage = messages[messages.length - 1];
    const nextCursor =
      messages.length === limit
        ? paginateCursor.encoder(lastMessage.createdAt, lastMessage.id)
        : null;

    return NextResponse.json({ data: messages, nextCursor });
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const paginateCursor = {
  encoder: (date: Date, id: string) => `${date.toISOString()}|${id}`,
  decoder: (cursor: string) => {
    const [cursorDate, cursorId] = cursor.split("|");
    const date = new Date(cursorDate);
    return { date, cursorId };
  },
};
