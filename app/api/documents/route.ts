import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { UserRole } from "@/lib/constants";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!(session?.user?.id && session.user.role === UserRole.ADMIN)) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Query to get distinct file names with their earliest created_at timestamp
    const whereCondition = session.user.role === UserRole.ADMIN ? undefined : eq(documents.userId, session.user.id);

    const userDocuments = await db
      .select({
        fileName: documents.filePath,
        createdAt: sql<Date>`MIN(${documents.createdAt})`.as("created_at"),
      })
      .from(documents)
      .where(whereCondition)
      .groupBy(documents.filePath)
      .orderBy(sql`MIN(${documents.createdAt}) DESC`);

    return NextResponse.json({
      success: true,
      documents: userDocuments,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
