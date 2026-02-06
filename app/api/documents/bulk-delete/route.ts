import { authOptions } from "@/lib/auth";
import { UserRole } from "@/lib/constants";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { supabase } from "@/lib/supabase";
import { inArray } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Auth Check
    if (!(session?.user?.id && session.user.role === UserRole.ADMIN)) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { fileNames } = await req.json();
    if (!fileNames || !Array.isArray(fileNames) || fileNames.length === 0) {
      return NextResponse.json({ error: "fileNames array is required" }, { status: 400 });
    }

    // 1. Storage Cleanup
    // Prepare all paths (prefixed and legacy)
    const pathsToDelete = fileNames.flatMap((name) => [`${session.user.id}/${name}`, name]);

    const { error: storageError } = await supabase.storage.from("documents").remove(pathsToDelete);

    if (storageError) {
      console.warn("Bulk storage deletion warning:", storageError.message);
    }

    // 2. Database Cleanup
    // Delete all records where filePath is in our list, regardless of userId
    await db.delete(documents).where(inArray(documents.filePath, fileNames));

    return NextResponse.json({
      success: true,
      message: `${fileNames.length} files and associated data deleted successfully.`,
    });
  } catch (error) {
    console.error("Error in bulk document deletion:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
