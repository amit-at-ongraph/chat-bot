import { authOptions } from "@/lib/auth";
import { UserRole } from "@/lib/constants";
import { db } from "@/lib/db";
import { ragChunks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ chunkId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session?.user?.id && session.user.role === UserRole.ADMIN)) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { chunkId } = await params;

    const [chunk] = await db
      .select()
      .from(ragChunks)
      .where(eq(ragChunks.chunkId, chunkId))
      .limit(1);

    if (!chunk) {
      return NextResponse.json({ error: "Chunk not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      chunk,
    });
  } catch (error) {
    console.error("Error fetching chunk:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
