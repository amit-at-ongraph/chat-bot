import { createRequire } from "module";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const require = createRequire(import.meta.url);

export async function POST(req: Request) {
  try {
    // ✅ Node-safe CJS import
    const pdfParse = require("pdf-parse") as (buffer: Buffer) => Promise<{ text: string }>;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await pdfParse(buffer);

    return NextResponse.json({
      text: data.text,
    });
  } catch (err) {
    console.error("PDF parse error:", err);
    return NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 });
  }
}
