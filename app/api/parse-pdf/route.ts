import { NextResponse } from "next/server";
// 1. SILENCE THE ERRORS: Define globals before any imports
// We use globalThis to ensure it attaches to the environment immediately
if (typeof (globalThis as any).DOMMatrix === "undefined") {
  (globalThis as any).DOMMatrix = class DOMMatrix {
    constructor() {
      return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
    }
  };
}

// 1. Use the legacy build to avoid DOMMatrix/Canvas errors
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

// 2. EXPLICITLY import the worker to ensure it gets bundled
// @ts-ignore - this is often needed for the .mjs extension in TS
import * as pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.mjs";

// 3. Manually assign the worker
// This tells PDF.js "don't look for a file, use this module I already loaded"
if (!pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

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

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const loadingTask = pdfjs.getDocument({
      data: uint8Array,
      disableFontFace: true,
      useSystemFonts: true,
      // We explicitly stop the library from looking for external scripts
      stopAtErrors: true,
      ownerDocument: globalThis.document, // helps it realize there is no document
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
