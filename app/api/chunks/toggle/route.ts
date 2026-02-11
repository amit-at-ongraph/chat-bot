import { authOptions } from "@/lib/auth";
import { LifecycleState, UserRole } from "@/lib/constants";
import { db } from "@/lib/db";
import { ragChunks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chunkId, status } = await req.json();

    if (!chunkId) {
      return NextResponse.json({ error: "Chunk ID is required" }, { status: 400 });
    }

    // Validate status if provided
    if (status && !Object.values(LifecycleState).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }


    // Update chunk status
    await db
      .update(ragChunks)
      .set({ lifecycleState: status })
      .where(eq(ragChunks.chunkId, chunkId));

    return NextResponse.json({
      success: true,
      newStatus: status,
    });
  } catch (error) {
    console.error("Error toggling chunk status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
