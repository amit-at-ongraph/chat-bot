import { authOptions } from "@/lib/auth";
import { UserRole } from "@/lib/constants";
import { db } from "@/lib/db";
import { ENUM_NAMES, ragChunks } from "@/lib/db/schema";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const query = searchParams.get("query");

    const filters = [];
    if (scenario) filters.push(eq(ragChunks.scenario, scenario as any));
    if (jurisdiction) filters.push(eq(ragChunks.jurisdiction, jurisdiction as any));
    if (lifecycleState) filters.push(eq(ragChunks.lifecycleState, lifecycleState as any));
    if (applicableRoles)
      filters.push(
        sql`${ragChunks.applicableRoles} @> ARRAY[${applicableRoles}]::${sql.raw(ENUM_NAMES.applicable_role)}[]`,
      );

    // Add search query filter
    if (query) {
      filters.push(
        or(ilike(ragChunks.content, `%${query}%`), ilike(ragChunks.topic, `%${query}%`)),
      );
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(ragChunks)
      .where(whereClause);

    const sortOrder = searchParams.get("sortOrder") || "desc";

    const chunks = await db
      .select()
      .from(ragChunks)
      .where(whereClause)
      .orderBy(sortOrder === "asc" ? asc(ragChunks.createdAt) : desc(ragChunks.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      chunks,
      pagination: {
        total: Number(count),
        page,
        limit,
        totalPages: Math.ceil(Number(count) / limit),
      },
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
