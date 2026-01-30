import { openai } from "@ai-sdk/openai";
import { embed } from "ai";
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  try {
    const { bucket, path } = await req.json();

    console.log(Deno.env.get("SUPABASE_URL"));
    console.log(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
    console.log("ENV CHECK:", {
      hasOpenAI: Deno.env.get("OPENAI_API_KEY"),
      hasPdfUrl: Deno.env.get("PDF_PARSER_URL"),
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await supabase.storage.from(bucket).download(path);

    if (error) throw error;

    const isPdf = path.toLowerCase().endsWith(".pdf");

    let text = "";

    if (isPdf) {
      text = await extractPdfText(data, path);
    } else {
      text = await data.text();
    }

    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: text,
    });

    await supabase.from("documents").insert({
      file_path: path,
      content: text,
      embedding,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
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
