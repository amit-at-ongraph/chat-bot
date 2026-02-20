import { isManualFile } from "@/app/upload/config/uploadConfig";
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
    const metadataStr = formData.get("metadata") as string;
    const metadata = metadataStr ? JSON.parse(metadataStr) : null;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadPromises = files.map(async (file) => {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());

        const filePath = file.name;

        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(filePath, buffer, {
            upsert: true,
            contentType: file.type || "application/octet-stream",
          });

        if (uploadError) {
          return {
            fileName: file.name,
            status: "failed" as const,
            error: uploadError.message,
          };
        }

        let functionSuccess = false;
        try {
          const { error: invokeError } = await supabase.functions.invoke("generate-embeddings", {
            body: {
              bucket: "documents",
              path: filePath,
              metadata,
            },
          });

          // Check if function invocation was successful (no error means 200 OK)
          if (invokeError) {
            console.error("Failed to trigger ingestion for", file.name, invokeError);
            functionSuccess = false;
          } else {
            // Function invocation successful (200 status)
            functionSuccess = true;
          }
        } catch (invokeError: any) {
          console.error("Failed to trigger ingestion for", file.name, invokeError);
          functionSuccess = false;
        }

        // If function returned 200 and file is manually created, delete it from storage
        if (functionSuccess && isManualFile(file.name)) {
          try {
            const { error: deleteError } = await supabase.storage
              .from("documents")
              .remove([filePath]);

            if (deleteError) {
              console.error(
                `Failed to delete manual file ${file.name} after successful processing:`,
                deleteError,
              );
              // Non-fatal error - file was processed successfully, just couldn't be deleted
            } else {
              console.log(`Successfully deleted manual file ${file.name} after processing`);
            }
          } catch (deleteError) {
            console.error(`Error deleting manual file ${file.name}:`, deleteError);
            // Non-fatal error - continue with success response
          }
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
      triggered: true,
    });
  } catch (err) {
    console.error("Upload API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
