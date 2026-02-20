import { authOptions } from "@/lib/auth";
import { UserRole } from "@/lib/constants";
import { db } from "@/lib/db";
import { ragChunks } from "@/lib/db/schema";
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
    const body = await req.json();

    // Fields that are considered metadata
    const {
      topic,
      jurisdiction,
      scenario,
      applicableRoles,
      lifecycleState,
      lastReviewed,
      lexicalTriggers,
      authorityLevel,
      sourceIds,
      retrievalWeight,
    } = body;

    await db
      .update(ragChunks)
      .set({
        topic,
        jurisdiction,
        scenario,
        applicableRoles,
        lifecycleState,
        lastReviewed,
        lexicalTriggers,
        authorityLevel,
        sourceIds,
        retrievalWeight,
      })
      .where(eq(ragChunks.chunkId, chunkId));

    return NextResponse.json({
      success: true,
      message: "Metadata updated successfully",
    });
  } catch (error) {
    console.error("Error updating chunk metadata:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
