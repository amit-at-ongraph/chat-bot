import { embeddingModel } from "@/lib/ai";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@/lib/constants";
import { db } from "@/lib/db";
import { ragChunks, ragEmbeddings } from "@/lib/db/schema";
import { embed } from "ai";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ chunkId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session?.user?.id && session.user.role === UserRole.ADMIN)) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { chunkId } = await params;
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // 1. Update the content in rag_chunks
    await db.update(ragChunks).set({ content }).where(eq(ragChunks.chunkId, chunkId));

    // 2. Generate new embedding
    const { embedding } = await embed({
      model: embeddingModel,
      value: content,
    });

    // 3. Update or Insert the embedding in rag_embeddings
    // Check if embedding exists
    const [existingEmbedding] = await db
      .select()
      .from(ragEmbeddings)
      .where(eq(ragEmbeddings.chunkId, chunkId));

    if (existingEmbedding) {
      await db
        .update(ragEmbeddings)
        .set({
          embedding,
          model: "text-embedding-3-small",
        })
        .where(eq(ragEmbeddings.chunkId, chunkId));
    } else {
      await db.insert(ragEmbeddings).values({
        chunkId,
        embedding,
        model: "text-embedding-3-small",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Content and embedding updated successfully",
    });
  } catch (error) {
    console.error("Error updating chunk content:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
