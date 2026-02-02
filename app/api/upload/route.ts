import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // IMPORTANT (pdf, buffers, fs safety)

export async function POST(req: Request) {
  try {
    // --- BASIC AUTH CHECK ---
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Basic ")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Secure Area"' } },
      );
    }
    // END OF BASIC AUTH CHECK

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const results: Array<{
      fileName: string;
      status: "uploaded" | "failed";
      error?: string;
    }> = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error } = await supabase.storage.from("documents").upload(file.name, buffer, {
        upsert: true,
        contentType: file.type || "application/octet-stream",
      });

      if (error) {
        results.push({
          fileName: file.name,
          status: "failed",
          error: error.message,
        });
      } else {
        results.push({
          fileName: file.name,
          status: "uploaded",
        });
      }
    }

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
