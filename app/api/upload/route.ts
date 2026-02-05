import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // IMPORTANT (pdf, buffers, fs safety)

export async function POST(req: Request) {
  try {
    // --- SESSION AUTH CHECK ---
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    // END OF SESSION AUTH CHECK

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadPromises = files.map(async (file) => {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());

        const { error } = await supabase.storage
          .from("documents")
          .upload(`${session.user.id}/${file.name}`, buffer, {
            upsert: true,
            contentType: file.type || "application/octet-stream",
          });

        if (error) {
          return {
            fileName: file.name,
            status: "failed" as const,
            error: error.message,
          };
        }

        return {
          fileName: file.name,
          status: "uploaded" as const,
        };
      } catch (e: Error) {
        return {
          fileName: file.name,
          status: "failed" as const,
          error: e.message,
        };
      }
    });

    const results = (await Promise.allSettled(uploadPromises)).map((r) => {
      if (r.status === "fulfilled") return r.value;
      return {
        fileName: "unknown",
        status: "failed" as const,
        error: "Internal processing error",
      };
    });

    return NextResponse.json({
      success: true,
      uploaded: results,
      triggered: true, // ingestion pipeline triggered automatically
    });
  } catch (err) {
    console.error("Upload API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
