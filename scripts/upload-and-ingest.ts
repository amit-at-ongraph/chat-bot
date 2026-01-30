import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

console.log("URL:", process.env.SUPABASE_URL);
console.log("KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 10));

async function uploadFile(filePath: string) {
  const absolutePath = path.resolve(process.cwd(), filePath);

  console.log("Absolute path:", absolutePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  const fileBuffer = fs.readFileSync(absolutePath);
  const fileName = path.basename(filePath);

  const { error } = await supabase.storage.from("documents").upload(fileName, fileBuffer, {
    upsert: true,
    contentType: getMimeType(fileName),
  });

  if (error) {
    console.error("Upload failed:", error.message);
    return;
  }

  console.log(`✅ Uploaded ${fileName} → ingestion triggered`);
}

function getMimeType(fileName: string): string {
  if (fileName.endsWith(".pdf")) return "application/pdf";
  if (fileName.endsWith(".txt")) return "text/plain";
  return "application/octet-stream";
}

// CLI usage: node upload-and-ingest.js ./files/doc.pdf
const inputPath = process.argv[2];

if (!inputPath) {
  console.error("❌ Please provide file path");
  process.exit(1);
}

uploadFile(inputPath);
