// @ts-nocheck

import { openai } from "@ai-sdk/openai";
import { embedMany } from "ai";
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  try {
    const { bucket, path, metadata } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await supabase.storage.from(bucket).download(path);

    if (error) throw error;

    const [userId, fileName] = path.split("/");

    const isPdf = path.toLowerCase().endsWith(".pdf");

    let text = "";

    if (isPdf) {
      text = await extractPdfText(data, path);
    } else {
      text = await data.text();
    }

    const chunks = chunkText(text);
    const BATCH_SIZE = 100;

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);

      const { embeddings } = await embedMany({
        model: openai.embedding("text-embedding-3-small"),
        values: batch,
      });

      for (let j = 0; j < batch.length; j++) {
        const chunk = batch[j];
        const embedding = embeddings[j];

        // Insert into rag_chunks with metadata
        const { data: chunkData, error: chunkError } = await supabase
          .from("rag_chunks")
          .insert({
            content: chunk,
            topic: metadata?.topic || null,
            jurisdiction: metadata?.jurisdiction || null,
            scenario: metadata?.scenario || null,
            applicable_roles: metadata?.applicableRoles || [],
            authority_level: metadata?.authorityLevel || 0,
            lifecycle_state: metadata?.lifecycleState || "active",
            last_reviewed: metadata?.lastReviewed || null,
            lexical_triggers: metadata?.lexicalTriggers || [],
            retrieval_weight: metadata?.retrievalWeight || 1.0,
            source_ids: [fileName || path],
          })
          .select("chunk_id")
          .single();

        if (chunkError) {
          console.error("Error inserting chunk:", chunkError);
          continue;
        }

        // Insert into rag_embeddings
        const { error: embedError } = await supabase.from("rag_embeddings").insert({
          chunk_id: chunkData.chunk_id,
          embedding: embedding,
          model: "text-embedding-3-small",
        });

        if (embedError) {
          console.error("Error inserting embedding:", embedError);
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});

async function extractPdfText(blob: Blob, fileName: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", blob, fileName);

  const res = await fetch(Deno.env.get("PDF_PARSER_URL")!, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Basic ${Deno.env.get("API_BASIC_AUTH_SECRET")}`,
    },
  });

  if (!res.ok) {
    throw new Error("PDF parsing failed");
  }

  const { text } = await res.json();
  return text;
}

function chunkText(
  text: string,
  chunkSize = 3000, // characters ≈ 800–1000 tokens
  overlap = 500,
): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = start + chunkSize;
    chunks.push(text.slice(start, end));
    start = end - overlap;
  }

  return chunks;
}
