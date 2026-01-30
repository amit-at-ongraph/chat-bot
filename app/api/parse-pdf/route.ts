import { NextResponse } from "next/server";

export const runtime = "nodejs";

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

    // 1. Define the polyfill IMMEDIATELY before doing anything else
    if (typeof globalThis.DOMMatrix === "undefined") {
      (globalThis as any).DOMMatrix = class DOMMatrix {
        constructor() {
          return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
        }
      };
    }

    // 2. DYNAMICALLY import the library to ensure it sees the polyfill
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const pdfjsWorker = await import("pdfjs-dist/legacy/build/pdf.worker.mjs");

    // Set the worker correctly
    // (pdfjs as any).GlobalWorkerOptions.workerSrc = pdfjsWorker;

    // 3. Process your PDF
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(arrayBuffer),
      disableFontFace: true,
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(" ");

      if (pageText.trim()) {
        fullText += `\n\n--- Page ${pageNum} ---\n\n${pageText}`;
      }
    }

    return NextResponse.json({
      success: true,
      pages: pdf.numPages,
      text: fullText,
    });
  } catch (err: any) {
    console.error("Final PDF parsing attempt error:", err);
    return NextResponse.json(
      { error: "PDF parsing failed", details: err.message },
      { status: 500 },
    );
  }
}
