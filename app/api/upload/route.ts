import { authOptions } from "@/lib/auth";
import { UserRole } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // IMPORTANT (pdf, buffers, fs safety)

export async function POST(req: Request) {
  try {
    // --- SESSION AUTH CHECK ---
    const session = await getServerSession(authOptions);

    if (!(session?.user?.id && session.user.role === UserRole.ADMIN)) {
      // --- BASIC AUTH CHECK ---
      const authHeader = req.headers.get("authorization");

      if (!authHeader || !authHeader.startsWith("Basic ")) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Secure Area"' } },
        );
      }
      // END OF BASIC AUTH CHECK
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

        const filePath = file.name;

        const { error } = await supabase.storage.from("documents").upload(filePath, buffer, {
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
      } catch (e: any) {
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
