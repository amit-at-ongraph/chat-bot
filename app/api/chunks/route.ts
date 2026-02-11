import { authOptions } from "@/lib/auth";
import { UserRole } from "@/lib/constants";
import { db } from "@/lib/db";
import { ENUM_NAMES, ragChunks } from "@/lib/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session?.user?.id && session.user.role === UserRole.ADMIN)) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scenario = searchParams.get("scenario");
    const jurisdiction = searchParams.get("jurisdiction");
    const lifecycleState = searchParams.get("lifecycleState");
    const applicableRoles = searchParams.get("applicableRoles");

    const filters = [];
    if (scenario) filters.push(eq(ragChunks.scenario, scenario as any));
    if (jurisdiction) filters.push(eq(ragChunks.jurisdiction, jurisdiction as any));
    if (lifecycleState) filters.push(eq(ragChunks.lifecycleState, lifecycleState as any));
    if (applicableRoles)
      filters.push(
        sql`${ragChunks.applicableRoles} @> ARRAY[${applicableRoles}]::${sql.raw(ENUM_NAMES.applicable_role)}[]`,
      );

    const chunks = await db
      .select()
      .from(ragChunks)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(desc(ragChunks.createdAt));

    return NextResponse.json({
      success: true,
      chunks,
    });
  } catch (error) {
    console.error("Error fetching chunks:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session?.user?.id && session.user.role === UserRole.ADMIN)) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const chunkId = searchParams.get("chunkId");

    if (!chunkId) {
      return NextResponse.json({ error: "Chunk ID is required" }, { status: 400 });
    }

    await db.delete(ragChunks).where(eq(ragChunks.chunkId, chunkId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chunk:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
